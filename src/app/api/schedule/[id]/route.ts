import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

type Params = { id: string }

export async function GET(_request: NextRequest, { params }: { params: Promise<Params> }) {
  try {
    const { id } = await params
    const schedule = await db.projectSchedule.findUnique({
      where: { id },
      include: {
        _count: { select: { items: true } },
      },
    })

    if (!schedule) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
    }

    return NextResponse.json({
      schedule: {
        id: schedule.id,
        name: schedule.name,
        description: schedule.description,
        createdAt: schedule.createdAt.toISOString(),
        updatedAt: schedule.updatedAt.toISOString(),
        itemsCount: schedule._count.items,
      },
    })
  } catch (error) {
    console.error('Schedule detail fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch schedule' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<Params> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, description } = body as { name?: string; description?: string }

    const data: { name?: string; description?: string } = {}
    if (typeof name === 'string' && name.trim()) data.name = name.trim()
    if (typeof description === 'string') data.description = description

    if (!Object.keys(data).length) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const schedule = await db.projectSchedule.update({
      where: { id },
      data,
    })

    return NextResponse.json({
      schedule: {
        id: schedule.id,
        name: schedule.name,
        description: schedule.description,
        createdAt: schedule.createdAt.toISOString(),
        updatedAt: schedule.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('Schedule update error:', error)
    return NextResponse.json({ error: 'Failed to update schedule' }, { status: 500 })
  }
}

