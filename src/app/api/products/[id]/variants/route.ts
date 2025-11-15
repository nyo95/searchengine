import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { db } from '@/lib/db'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { name, price, attributes } = body as { name: string; price?: number | null; attributes?: Record<string, any> }
    if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })
    const variant = await db.variant.create({
      data: {
        productId: params.id,
        name,
        price: typeof price === 'number' ? new Prisma.Decimal(price) : null,
        attributes: attributes || {},
      },
    })
    return NextResponse.json({ variant })
  } catch (error) {
    console.error('Add variant error', error)
    return NextResponse.json({ error: 'Failed to add variant' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { variantId, attributes, name, price } = body as {
      variantId: string
      attributes?: Record<string, any>
      name?: string
      price?: number | null
    }
    if (!variantId) return NextResponse.json({ error: 'variantId required' }, { status: 400 })

    const updated = await db.variant.update({
      where: { id: variantId },
      data: {
        name: typeof name === 'string' && name.trim() ? name : undefined,
        price: typeof price === 'number' ? new Prisma.Decimal(price) : undefined,
        attributes: attributes ?? undefined,
      },
    })
    return NextResponse.json({ variant: updated })
  } catch (error) {
    console.error('Update variant error', error)
    return NextResponse.json({ error: 'Failed to update variant' }, { status: 500 })
  }
}
