import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest, { params }: { params: { projectId: string } }) {
  try {
    const payload = await request.json()
    const { itemIdA, itemIdB } = payload || {}
    if (!itemIdA || !itemIdB) {
      return NextResponse.json({ error: 'Two items are required to swap' }, { status: 400 })
    }

    const [first, second] = await db.projectScheduleItem.findMany({
      where: { projectId: params.projectId, id: { in: [itemIdA, itemIdB] } },
      include: { product: { include: { subcategory: true } } },
    })

    if (!first || !second) return NextResponse.json({ error: 'Items not found' }, { status: 404 })

    if (first.product.subcategoryId !== second.product.subcategoryId) {
      return NextResponse.json({ error: 'Cannot swap codes across different subcategories' }, { status: 400 })
    }

    await db.$transaction([
      db.projectScheduleItem.update({ where: { id: first.id }, data: { code: second.code } }),
      db.projectScheduleItem.update({ where: { id: second.id }, data: { code: first.code } }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Swap codes error', error)
    return NextResponse.json({ error: 'Failed to swap codes' }, { status: 500 })
  }
}
