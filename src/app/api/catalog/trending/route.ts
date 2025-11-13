import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { serializeProduct } from '@/lib/serializers/product'

const DEFAULT_LIMIT = 6
const MAX_LIMIT = 20

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(
      Math.max(parseInt(searchParams.get('limit') || `${DEFAULT_LIMIT}`, 10), 1),
      MAX_LIMIT,
    )

    const products = await db.product.findMany({
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
      ],
      take: limit,
    })

    return NextResponse.json({
      products: products.map((product) => {
        const serialized = serializeProduct(product)
        return {
          ...serialized,
          primaryImage: serialized.images[0]?.url ?? '/api/placeholder/300/300',
          categoryName: serialized.category?.name ?? serialized.brand.category?.name ?? '',
        }
      }),
    })
  } catch (error) {
    console.error('Trending products error:', error)
    return NextResponse.json({ error: 'Failed to fetch trending products' }, { status: 500 })
  }
}
