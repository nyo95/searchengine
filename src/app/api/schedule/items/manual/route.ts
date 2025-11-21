import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

// Basic stub to satisfy manual item creation; stores data in-memory only.
const globalStore = globalThis as unknown as { __manualScheduleItems?: any[] }
const items = globalStore.__manualScheduleItems ?? (globalStore.__manualScheduleItems = [])

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const now = new Date().toISOString()
    const item = { id: randomUUID(), createdAt: now, ...body }
    items.push(item)
    return NextResponse.json({ item }, { status: 201 })
  } catch (error) {
    console.error('Manual schedule item error:', error)
    return NextResponse.json({ error: 'Failed to create manual schedule item' }, { status: 500 })
  }
}
