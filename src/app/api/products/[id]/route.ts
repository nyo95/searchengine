import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { db } from '@/lib/db'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { description } = body as { description?: string }
    const product = await db.product.update({ where: { id: params.id }, data: { description } })
    return NextResponse.json({ product })
  } catch (error) {
    console.error('Product update error', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

