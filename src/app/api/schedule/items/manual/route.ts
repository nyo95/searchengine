import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ensureUser } from '@/server/user'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { scheduleId, userId, notes } = body as {
      scheduleId: string
      userId: string
      notes?: string
    }

    if (!scheduleId || !userId) {
      return NextResponse.json({ error: 'scheduleId and userId are required' }, { status: 400 })
    }

    const normalizedUser = await ensureUser(userId)
    const schedule = await db.projectSchedule.findUnique({ where: { id: scheduleId } })
    if (!schedule) return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
    if (schedule.userId !== normalizedUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const count = await db.scheduleItem.count({ where: { scheduleId } })
    const code = `NEW-${String(count + 1).padStart(3, '0')}`

    const item = await db.scheduleItem.create({
      data: {
        scheduleId,
        productId: null,
        variantId: null,
        productName: code,
        brandName: '',
        sku: '',
        price: null,
        attributes: { code },
        quantity: 1,
        unitOfMeasure: 'pcs',
        area: null,
        notes: notes ?? null,
      },
    })

    return NextResponse.json({ item })
  } catch (error) {
    console.error('Manual schedule item creation error:', error)
    return NextResponse.json({ error: 'Failed to create schedule item' }, { status: 500 })
  }
}

