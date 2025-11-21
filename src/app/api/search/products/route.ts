import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { serializeProduct } from '@/lib/serializers/product'

const DEFAULT_PAGE_SIZE = 20
const MAX_PAGE_SIZE = 50

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.trim() ?? ''
    const brandId = searchParams.get('brandId')?.trim()
    const categoryId = searchParams.get('categoryId')?.trim()
    const subcategoryId = searchParams.get('subcategoryId')?.trim()
    const isActiveParam = searchParams.get('isActive')
    const isActive = isActiveParam === 'false' ? false : true
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1)
    const pageSize = Math.min(
      Math.max(parseInt(searchParams.get('pageSize') || `${DEFAULT_PAGE_SIZE}`, 10), 1),
      MAX_PAGE_SIZE,
    )

    const where: Prisma.ProductWhereInput = {
      isActive,
    }
    if (brandId) where.brandId = brandId
    if (categoryId) where.categoryId = categoryId
    if (subcategoryId) where.subcategoryId = subcategoryId

    if (query) {
      const tokens = query.split(/\s+/).filter(Boolean)
      if (tokens.length) {
        where.AND = tokens.map((token) => ({
          OR: [
            { name: { contains: token, mode: 'insensitive' } },
            { sku: { contains: token, mode: 'insensitive' } },
            { internalCode: { contains: token, mode: 'insensitive' } },
            { tags: { has: token.toLowerCase() } },
            { brand: { name: { contains: token, mode: 'insensitive' } } },
            { subcategory: { name: { contains: token, mode: 'insensitive' } } },
          ],
        }))
      }
    }

    const offset = (page - 1) * pageSize
    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          brand: true,
          category: true,
          subcategory: true,
        },
        skip: offset,
        take: pageSize,
        orderBy: { updatedAt: 'desc' },
      }),
      db.product.count({ where }),
    ])

    const items = products.map((product) => serializeProduct(product)).filter(Boolean)
    return NextResponse.json({
      items,
      total,
      page,
      pageSize,
      hasMore: page * pageSize < total,
    })
  } catch (error) {
    console.error('Search products error', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
