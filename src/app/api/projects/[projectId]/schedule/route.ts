import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateScheduleCode } from '@/lib/schedule'

export async function GET(_request: NextRequest, { params }: { params: { projectId: string } }) {
  try {
    const items = await db.projectScheduleItem.findMany({
      where: { projectId: params.projectId },
      include: { product: { include: { brand: true, subcategory: true } } },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json({ items })
  } catch (error) {
    console.error('Schedule fetch error', error)
    return NextResponse.json({ error: 'Failed to fetch schedule' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { projectId: string } }) {
  try {
    const payload = await request.json()
    if (!payload.productId) return NextResponse.json({ error: 'Product is required' }, { status: 400 })

    const code = await generateScheduleCode(params.projectId, payload.productId)

    const item = await db.projectScheduleItem.create({
      data: {
        projectId: params.projectId,
        productId: payload.productId,
        code,
        quantity: payload.quantity ?? null,
        notes: payload.notes?.trim() || null,
      },
      include: { product: { include: { brand: true, subcategory: true } } },
    })

    return NextResponse.json({ item })
  } catch (error: any) {
    const message = error?.message || 'Failed to create schedule item'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
