import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ensureUser } from '@/server/user'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const normalizedUser = await ensureUser(userId)

    const schedules = await db.projectSchedule.findMany({
      where: { userId: normalizedUser.id },
      include: {
        items: {
          select: {
            price: true,
            quantity: true,
          },
        },
        _count: {
          select: { items: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      schedules: schedules.map((schedule) => ({
        id: schedule.id,
        name: schedule.name,
        description: schedule.description,
        createdAt: schedule.createdAt.toISOString(),
        updatedAt: schedule.updatedAt.toISOString(),
        itemsCount: schedule._count.items,
        totalAmount: schedule.items.reduce(
          (total, item) => total + Number(item.price) * (item.quantity || 1),
          0,
        ),
      })),
    })
  } catch (error) {
    console.error('Schedule fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch schedules' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, name, description } = body

    if (!userId || !name?.trim()) {
      return NextResponse.json({ error: 'userId and name are required' }, { status: 400 })
    }

    const normalizedUser = await ensureUser(userId)

    const schedule = await db.projectSchedule.create({
      data: {
        userId: normalizedUser.id,
        name: name.trim(),
        description: description?.trim(),
      },
    })

    return NextResponse.json({
      schedule: {
        id: schedule.id,
        name: schedule.name,
        description: schedule.description,
        createdAt: schedule.createdAt.toISOString(),
        updatedAt: schedule.updatedAt.toISOString(),
        itemsCount: 0,
        totalAmount: 0,
      },
    })
  } catch (error) {
    console.error('Schedule creation error:', error)
    return NextResponse.json({ error: 'Failed to create schedule' }, { status: 500 })
  }
}
