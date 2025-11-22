import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(request: NextRequest, { params }: { params: { projectId: string; itemId: string } }) {
  try {
    const payload = await request.json()
    const data: Record<string, any> = {}

    if (payload.quantity !== undefined) data.quantity = payload.quantity ?? null
    if (payload.notes !== undefined) data.notes = payload.notes?.trim() || null

    if (!Object.keys(data).length) return NextResponse.json({ error: 'No changes provided' }, { status: 400 })

    const item = await db.projectScheduleItem.update({
      where: { id: params.itemId, projectId: params.projectId },
      data,
      include: { product: { include: { brand: true, subcategory: true } } },
    })
    return NextResponse.json({ item })
  } catch (error) {
    console.error('Schedule item update error', error)
    return NextResponse.json({ error: 'Failed to update schedule item' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { projectId: string; itemId: string } }) {
  try {
    await db.projectScheduleItem.delete({ where: { id: params.itemId, projectId: params.projectId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Schedule item delete error', error)
    return NextResponse.json({ error: 'Failed to delete schedule item' }, { status: 500 })
  }
}

export async function GET(_request: NextRequest, { params }: { params: { projectId: string; itemId: string } }) {
  try {
    const item = await db.projectScheduleItem.findUnique({
      where: { id: params.itemId, projectId: params.projectId },
      include: { product: { include: { brand: true, subcategory: true } } },
    })
    if (!item) return NextResponse.json({ error: 'Schedule item not found' }, { status: 404 })
    return NextResponse.json({ item })
  } catch (error) {
    console.error('Schedule item fetch error', error)
    return NextResponse.json({ error: 'Failed to fetch schedule item' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, ctx: { params: { projectId: string; itemId: string } }) {
  return PATCH(request, ctx)
}
