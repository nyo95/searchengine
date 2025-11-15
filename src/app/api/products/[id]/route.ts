import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json()
    const { name, description } = body as { name?: string; description?: string }

    const data: { name?: string; description?: string } = {}
    if (typeof name === 'string' && name.trim()) {
      data.name = name.trim()
    }
    if (typeof description === 'string') {
      data.description = description
    }

    const { id } = await params
    const product = await db.product.update({
      where: { id },
      data,
    })

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Product update error', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}
