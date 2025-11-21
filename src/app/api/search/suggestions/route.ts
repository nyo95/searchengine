import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const MAX_LIMIT = 10

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.trim() ?? ''
    const limit = Math.min(
      Math.max(parseInt(searchParams.get('limit') || '5', 10), 1),
      MAX_LIMIT,
    )

    if (!query) {
      return NextResponse.json({ suggestions: [] })
    }

    const suggestions = await db.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { sku: { contains: query, mode: 'insensitive' } },
          { internalCode: { contains: query, mode: 'insensitive' } },
          { brand: { name: { contains: query, mode: 'insensitive' } } },
        ],
      },
      include: { brand: true },
      take: limit,
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json({
      suggestions: suggestions.map((product) => ({
        code: product.internalCode,
        name: product.name,
        brandName: product.brand?.name ?? null,
      })),
    })
  } catch (error) {
    console.error('Suggestions error', error)
    return NextResponse.json({ error: 'Failed to get suggestions' }, { status: 500 })
  }
}
