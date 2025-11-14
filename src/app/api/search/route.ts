import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { serializeProduct } from '@/lib/serializers/product'

type SearchFilters = {
  category?: string
  brand?: string
}

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 50

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.trim() ?? ''
    const category = searchParams.get('category')?.trim() || undefined
    const brand = searchParams.get('brand')?.trim() || undefined
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || `${DEFAULT_LIMIT}`, 10), 1), MAX_LIMIT)
    const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10), 0)

    if (!query) return NextResponse.json({ products: [], total: 0, hasMore: false })

    const tokens = new Set(query.split(/\s+/).map((t) => t.trim()).filter(Boolean))
    const synonyms = await db.searchSynonym.findMany({
      where: { OR: [{ term: { contains: query, mode: 'insensitive' } }, { synonym: { contains: query, mode: 'insensitive' } }] },
    })
    for (const s of synonyms) {
      if (s.term) tokens.add(s.term)
      if (s.synonym) tokens.add(s.synonym)
    }

    const where = buildProductWhereInput(tokens, { category, brand })

    const [rows, total] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          variants: true,
          media: true,
          productType: { include: { brand: { include: { category: true } } } },
          brand: { include: { category: true } },
          category: true,
        },
        orderBy: [{ usageCount: 'desc' }, { viewCount: 'desc' }, { updatedAt: 'desc' }],
        skip: offset,
        take: limit,
      }),
      db.product.count({ where }),
    ])

    const products = rows
      .map((p) => {
        const sp = serializeProduct(p)
        const score = sp.usageCount * 2 + sp.viewCount
        return {
          ...sp,
          score,
          primaryImage: sp.images[0]?.url ?? '/api/placeholder/200/200',
          categoryName: sp.category?.name ?? sp.brand.category?.name ?? '',
          brandName: sp.brand.name,
          productTypeName: sp.productType.name,
        }
      })
      .sort((a, b) => b.score - a.score)

    await db.product.updateMany({ where: { id: { in: rows.map((r) => r.id) } } , data: { viewCount: { increment: 1 } } })

    return NextResponse.json({ products, total, hasMore: offset + limit < total })
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
      { brand: { category: { name: { contains: token, mode: 'insensitive' } } } },
    ])
  }

  const andFilters: Prisma.ProductWhereInput[] = []
  if (filters.brand) andFilters.push({ OR: [{ brand: { id: filters.brand } }, { brand: { name: { equals: filters.brand, mode: 'insensitive' } } }] })
  if (filters.category)
    andFilters.push({
      OR: [
        { category: { id: filters.category } },
        { category: { name: { equals: filters.category, mode: 'insensitive' } } },
        { brand: { category: { id: filters.category } } },
        { brand: { category: { name: { equals: filters.category, mode: 'insensitive' } } } },
      ],
    })
  if (andFilters.length) where.AND = andFilters
  return where
}

