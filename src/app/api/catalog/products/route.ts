import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const brandId = searchParams.get('brandId') || undefined
    const productTypeId = searchParams.get('productTypeId') || undefined
    const productId = searchParams.get('productId') || undefined
    const q = searchParams.get('q')?.trim()

    const where: any = {}
    if (productId) {
      where.id = productId
    } else {
      if (brandId) where.brandId = brandId
      if (productTypeId) where.productTypeId = productTypeId
      if (q) {
        where.OR = [
          { name: { contains: q, mode: 'insensitive' } },
          { sku: { contains: q, mode: 'insensitive' } },
        ]
      }
    }

    const products = await db.product.findMany({
      where,
      include: {
        brand: true,
        productType: true,
      },
      orderBy: { name: 'asc' },
      take: 100,
    })

    return NextResponse.json({
      products: products.map((p) => ({
        id: p.id,
        sku: p.sku,
        name: p.name,
        brandId: p.brandId,
        brandName: p.brand.name,
        productTypeId: p.productTypeId,
        productTypeName: p.productType.name,
      })),
    })
  } catch (error) {
    console.error('Catalog products error:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

