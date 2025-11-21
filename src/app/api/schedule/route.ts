import { randomUUID } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

type ScheduleRecord = {
  id: string
  name: string
  description?: string | null
  userId: string
  createdAt: string
  updatedAt: string
}

const globalStore = globalThis as unknown as { __schedules?: ScheduleRecord[] }
const schedules = globalStore.__schedules ?? (globalStore.__schedules = [])

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId') || ''
  const filtered = userId ? schedules.filter((item) => item.userId === userId) : schedules

  return NextResponse.json({
    schedules: filtered.map((schedule) => ({
      ...schedule,
      itemsCount: 0,
    })),
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, userId } = body || {}
    if (!name || !userId) {
      return NextResponse.json({ error: 'name and userId are required' }, { status: 400 })
    }

    const now = new Date().toISOString()
    const schedule: ScheduleRecord = {
      id: randomUUID(),
      name,
      description: description ?? null,
      userId,
      createdAt: now,
      updatedAt: now,
    }
    schedules.unshift(schedule)

    return NextResponse.json({ schedule }, { status: 201 })
  } catch (error) {
    console.error('Schedule create error:', error)
    return NextResponse.json({ error: 'Failed to create schedule' }, { status: 500 })
  }
}
