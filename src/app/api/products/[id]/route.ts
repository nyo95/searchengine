import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const product = await db.product.findUnique({
      where: { id: params.id },
      include: { brand: true, subcategory: true },
    })
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    return NextResponse.json({ product })
  } catch (error) {
    console.error('Product fetch error', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = await request.json()
    const data: Record<string, any> = {}
    if (payload.name !== undefined) {
      if (!payload.name?.trim()) return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 })
      data.name = payload.name.trim()
    }
    if (payload.skuOrType !== undefined) {
      if (!payload.skuOrType?.trim()) return NextResponse.json({ error: 'SKU/Type cannot be empty' }, { status: 400 })
      data.skuOrType = payload.skuOrType.trim()
    }
    if (payload.brandId !== undefined) {
      data.brandId = payload.brandId
    }
    if (payload.subcategoryId !== undefined) {
      data.subcategoryId = payload.subcategoryId
    }
    if (payload.attributesData !== undefined) {
      data.attributesData = payload.attributesData
    }

    if (!Object.keys(data).length) return NextResponse.json({ error: 'No changes provided' }, { status: 400 })

    const product = await db.product.update({ where: { id: params.id }, data, include: { brand: true, subcategory: true } })
    return NextResponse.json({ product })
  } catch (error) {
    console.error('Product update error', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db.product.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Product delete error', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, ctx: { params: { id: string } }) {
  return PATCH(request, ctx)
}
