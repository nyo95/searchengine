import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { normalizeDisplayName } from '@/lib/catalog-utils'
import { serializeProduct } from '@/lib/serializers/product'

type UpdateProductPayload = {
  name?: string
  sku?: string
  description?: string
  imageUrl?: string
  dynamicAttributes?: Record<string, unknown>
  isActive?: boolean
}

function includeProductRelations() {
  return {
    brand: true,
    category: true,
    subcategory: true,
  }
}

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const product = await db.product.findUnique({
      where: { id: params.id },
      include: includeProductRelations(),
    })
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    return NextResponse.json({ product: serializeProduct(product) })
  } catch (error) {
    console.error('Product fetch error', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  return handleUpdate(request, params.id)
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  return handleUpdate(request, params.id)
}

async function handleUpdate(request: NextRequest, productId: string) {
  try {
    const payload: UpdateProductPayload = await request.json()
    if (!payload.name && !payload.sku && payload.description === undefined && payload.imageUrl === undefined && payload.dynamicAttributes === undefined && payload.isActive === undefined) {
      return NextResponse.json({ error: 'No changes provided' }, { status: 400 })
    }

    const existing = await db.product.findUnique({ where: { id: productId } })
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (payload.name) {
      updateData.name = normalizeDisplayName(payload.name)
    }
    if (payload.sku) {
      const trimmedSku = payload.sku.trim()
      const duplicate = await db.product.findUnique({ where: { sku: trimmedSku } })
      if (duplicate && duplicate.id !== productId) {
        return NextResponse.json({ error: 'SKU already exists' }, { status: 409 })
      }
      updateData.sku = trimmedSku
    }
    if (payload.description !== undefined) {
      updateData.description = payload.description?.trim() || null
    }
    if (payload.imageUrl !== undefined) {
      updateData.imageUrl = payload.imageUrl?.trim() || null
    }
    if (payload.dynamicAttributes !== undefined) {
      updateData.dynamicAttributes = payload.dynamicAttributes
    }
    if (payload.isActive !== undefined) {
      updateData.isActive = payload.isActive
    }

    const updated = await db.product.update({
      where: { id: productId },
      data: updateData,
      include: includeProductRelations(),
    })

    return NextResponse.json({ product: serializeProduct(updated) })
  } catch (error) {
    console.error('Product update error', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      if (Array.isArray(error.meta?.target) && error.meta?.target.includes('sku')) {
        return NextResponse.json({ error: 'SKU already exists' }, { status: 409 })
      }
    }
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}
