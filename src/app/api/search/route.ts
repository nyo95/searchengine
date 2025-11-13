import { NextRequest, NextResponse } from 'next/server'
import { ActivityType, Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { serializeProduct } from '@/lib/serializers/product'
import { ensureUser, updatePreferencesFromActivity } from '@/server/user'

type SearchFilters = {
  category?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
}

type PreferenceIndex = {
  brands: Record<string, number>
  categories: Record<string, number>
  attributes: Record<string, number>
}

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 50

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.trim() ?? ''
    const category = searchParams.get('category')?.trim()
    const brand = searchParams.get('brand')?.trim()
    const minPrice = parseFloat(searchParams.get('minPrice') || '')
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '')
    const limit = Math.min(
      Math.max(parseInt(searchParams.get('limit') || `${DEFAULT_LIMIT}`, 10), 1),
      MAX_LIMIT,
    )
    const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10), 0)
    const userId = searchParams.get('userId')?.trim() || 'anonymous'

    if (!query) {
      return NextResponse.json({ products: [], total: 0, hasMore: false })
    }

    const filters: SearchFilters = {
      category: category || undefined,
      brand: brand || undefined,
      minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
      maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
    }

    const tokens = new Set(
      query
        .split(/\s+/)
        .map((token) => token.trim())
        .filter(Boolean),
    )

    const synonyms = await db.searchSynonym.findMany({
      where: {
        OR: [
          { term: { contains: query, mode: 'insensitive' } },
          { synonym: { contains: query, mode: 'insensitive' } },
        ],
      },
    })

    synonyms.forEach((synonym) => {
      if (synonym.term) tokens.add(synonym.term)
      if (synonym.synonym) tokens.add(synonym.synonym)
    })

    const where = buildProductWhereInput(tokens, filters)

    const [products, total, preferences] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          variants: true,
          media: true,
          productType: {
            include: {
              brand: { include: { category: true } },
            },
          },
          brand: { include: { category: true } },
          category: true,
        },
        orderBy: [
          { usageCount: 'desc' },
          { viewCount: 'desc' },
          { updatedAt: 'desc' },
        ],
        skip: offset,
        take: limit,
      }),
      db.product.count({ where }),
      db.userPreference.findMany({ where: { userId } }),
    ])

    const preferenceIndex = buildPreferenceIndex(preferences)
    const personalizedProducts = products
      .map((product) => {
        const serialized = serializeProduct(product)
        const score =
          serialized.usageCount * 2 +
          serialized.viewCount +
          getPreferenceBoost(serialized, preferenceIndex)

        return {
          ...serialized,
          score,
          primaryImage: serialized.images[0]?.url ?? '/api/placeholder/200/200',
          categoryName: serialized.category?.name ?? serialized.brand.category?.name ?? '',
          brandName: serialized.brand.name,
          productTypeName: serialized.productType.name,
        }
      })
      .sort((a, b) => b.score - a.score)

    const normalizedUser = await ensureUser(userId)

    await Promise.all([
      db.userActivity.create({
        data: {
          userId: normalizedUser.id,
          type: ActivityType.SEARCH,
          searchQuery: query,
          filters,
        },
      }),
      updatePreferencesFromActivity(normalizedUser.id, ActivityType.SEARCH, {
        searchQuery: query,
      }),
    ])

    return NextResponse.json({
      products: personalizedProducts,
      total,
      hasMore: offset + limit < total,
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}

function buildProductWhereInput(tokens: Set<string>, filters: SearchFilters): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {}

  if (tokens.size) {
    where.OR = Array.from(tokens).flatMap((token) => [
      { name: { contains: token, mode: 'insensitive' } },
      { nameEn: { contains: token, mode: 'insensitive' } },
      { sku: { contains: token, mode: 'insensitive' } },
      { keywords: { has: token.toLowerCase() } },
      { brand: { name: { contains: token, mode: 'insensitive' } } },
      { productType: { name: { contains: token, mode: 'insensitive' } } },
      {
        brand: {
          category: {
            name: { contains: token, mode: 'insensitive' },
          },
        },
      },
    ])
  }

  const andFilters: Prisma.ProductWhereInput[] = []

  if (filters.brand) {
    andFilters.push({
      OR: [
        { brand: { id: filters.brand } },
        { brand: { name: { equals: filters.brand, mode: 'insensitive' } } },
      ],
    })
  }

  if (filters.category) {
    andFilters.push({
      OR: [
        { category: { id: filters.category } },
        { category: { name: { equals: filters.category, mode: 'insensitive' } } },
        {
          brand: {
            category: {
              id: filters.category,
            },
          },
        },
        {
          brand: {
            category: {
              name: { equals: filters.category, mode: 'insensitive' },
            },
          },
        },
      ],
    })
  }

  if (typeof filters.minPrice === 'number') {
    andFilters.push({
      OR: [
        { basePrice: { gte: filters.minPrice } },
        { variants: { some: { price: { gte: filters.minPrice } } } },
      ],
    })
  }

  if (typeof filters.maxPrice === 'number') {
    andFilters.push({
      OR: [
        { basePrice: { lte: filters.maxPrice } },
        { variants: { some: { price: { lte: filters.maxPrice } } } },
      ],
    })
  }

  if (andFilters.length) {
    where.AND = andFilters
  }

  return where
}

function buildPreferenceIndex(
  preferences: { key: string; value: string; type: string; weight: number }[],
): PreferenceIndex {
  return preferences.reduce<PreferenceIndex>(
    (acc, preference) => {
      const value = preference.value.toLowerCase()
      switch (preference.type) {
        case 'BRAND_PREFERENCE':
          acc.brands[value] = (acc.brands[value] || 0) + preference.weight
          break
        case 'CATEGORY_PREFERENCE':
          acc.categories[value] = (acc.categories[value] || 0) + preference.weight
          break
        case 'ATTRIBUTE_PREFERENCE':
          acc.attributes[value] = (acc.attributes[value] || 0) + preference.weight
          break
        default:
          break
      }
      return acc
    },
    { brands: {}, categories: {}, attributes: {} },
  )
}

function getPreferenceBoost(product: ReturnType<typeof serializeProduct>, preferenceIndex: PreferenceIndex) {
  let boost = 0

  const brandKey = product.brand.name.toLowerCase()
  if (preferenceIndex.brands[brandKey]) {
    boost += preferenceIndex.brands[brandKey]
  }

  const categoryName = product.category?.name ?? product.brand.category?.name
  if (categoryName) {
    const categoryKey = categoryName.toLowerCase()
    if (preferenceIndex.categories[categoryKey]) {
      boost += preferenceIndex.categories[categoryKey]
    }
  }

  product.variants.forEach((variant) => {
    Object.values(variant.attributes || {}).forEach((value) => {
      if (typeof value === 'string') {
        const attributeKey = value.toLowerCase()
        if (preferenceIndex.attributes[attributeKey]) {
          boost += preferenceIndex.attributes[attributeKey] * 0.25
        }
      }
    })
  })

  return boost
}
