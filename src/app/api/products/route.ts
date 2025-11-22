import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

function normalizeAttributes(value: any) {
  if (value === undefined) return null
  return value
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')?.trim()
    const brandId = searchParams.get('brandId')
    const subcategoryId = searchParams.get('subcategoryId')

    const products = await db.product.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { name: { contains: search, mode: 'insensitive' } },
                  { skuOrType: { contains: search, mode: 'insensitive' } },
                  { brand: { name: { contains: search, mode: 'insensitive' } } },
                ],
              }
            : {},
          brandId ? { brandId } : {},
          subcategoryId ? { subcategoryId } : {},
        ],
      },
      include: { brand: true, subcategory: true },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Products fetch error', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    if (!payload.name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    if (!payload.skuOrType?.trim()) return NextResponse.json({ error: 'SKU/Type is required' }, { status: 400 })
    if (!payload.brandId) return NextResponse.json({ error: 'Brand is required' }, { status: 400 })
    if (!payload.subcategoryId) return NextResponse.json({ error: 'Subcategory is required' }, { status: 400 })

    const product = await db.product.create({
      data: {
        name: payload.name.trim(),
        skuOrType: payload.skuOrType.trim(),
        brandId: payload.brandId,
        subcategoryId: payload.subcategoryId,
        attributesData: normalizeAttributes(payload.attributesData),
      },
      include: { brand: true, subcategory: true },
    })

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Product create error', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
