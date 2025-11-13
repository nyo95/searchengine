import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { ensureUser } from '@/server/user'

class HttpError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const scheduleId = searchParams.get('scheduleId')
    const userId = searchParams.get('userId')?.trim()

    if (!scheduleId) {
      return NextResponse.json({ error: 'scheduleId is required' }, { status: 400 })
    }

    if (userId) {
      await ensureScheduleOwnership(scheduleId, userId)
    }

    const items = await db.scheduleItem.findMany({
      where: { scheduleId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      items: items.map(serializeScheduleItem),
    })
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Schedule items fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch schedule items' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      scheduleId,
      userId,
      productId,
      variantId,
      productName,
      brandName,
      sku,
      price,
      attributes,
      quantity,
      unitOfMeasure,
      area,
      notes,
    } = body

    if (!scheduleId || !userId || !productId || !productName || !brandName || !sku || price === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const normalizedUser = await ensureUser(userId)
    await ensureScheduleOwnership(scheduleId, normalizedUser.id)

    const newItem = await db.scheduleItem.create({
      data: {
        scheduleId,
        productId,
        variantId,
        productName,
        brandName,
        sku,
        price: new Prisma.Decimal(price),
        attributes: attributes || {},
        quantity: quantity ?? 1,
        unitOfMeasure: unitOfMeasure || 'pcs',
        area,
        notes,
      },
    })

    await db.product.update({
      where: { id: productId },
      data: { usageCount: { increment: 1 } },
    })

    return NextResponse.json({ item: serializeScheduleItem(newItem) })
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Schedule item creation error:', error)
    return NextResponse.json({ error: 'Failed to add item to schedule' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('itemId')
    const userId = searchParams.get('userId')?.trim()

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 })
    }

    const item = await db.scheduleItem.findUnique({
      where: { id: itemId },
      select: { id: true, scheduleId: true },
    })

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    if (userId) {
      await ensureScheduleOwnership(item.scheduleId, userId)
    }

    await db.scheduleItem.delete({ where: { id: itemId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Schedule item deletion error:', error)
    return NextResponse.json({ error: 'Failed to delete schedule item' }, { status: 500 })
  }
}

async function ensureScheduleOwnership(scheduleId: string, userId: string) {
  const schedule = await db.projectSchedule.findUnique({
    where: { id: scheduleId },
    select: { id: true, userId: true },
  })

  if (!schedule) {
    throw new HttpError(404, 'Schedule not found')
  }

  if (schedule.userId !== userId) {
    throw new HttpError(403, 'You do not have access to this schedule')
  }
}

function serializeScheduleItem(item: {
  id: string
  scheduleId: string
  productId: string
  variantId: string | null
  productName: string
  brandName: string
  sku: string
  price: Prisma.Decimal
  attributes: Record<string, unknown>
  quantity: number
  unitOfMeasure: string
  area: string | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
}) {
  return {
    ...item,
    price: Number(item.price),
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }
}
