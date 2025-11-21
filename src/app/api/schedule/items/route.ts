import { randomUUID } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

type ScheduleItem = {
  id: string
  scheduleId: string
  productId?: string | null
  code?: string | null
  quantity?: number | null
  unitOfMeasure?: string | null
}

// Share items store across route modules.
const globalStore = globalThis as unknown as { __scheduleItems?: ScheduleItem[] }
const items = globalStore.__scheduleItems ?? (globalStore.__scheduleItems = [])

export async function GET(request: NextRequest) {
  const scheduleId = request.nextUrl.searchParams.get('scheduleId')
  const itemId = request.nextUrl.searchParams.get('itemId')

  if (itemId) {
    const item = items.find((entry) => entry.id === itemId)
    if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    return NextResponse.json({ item })
  }

  const filtered = scheduleId ? items.filter((entry) => entry.scheduleId === scheduleId) : items
  return NextResponse.json({ items: filtered })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { scheduleId, productId, code, quantity, unitOfMeasure } = body || {}
    if (!scheduleId) {
      return NextResponse.json({ error: 'scheduleId is required' }, { status: 400 })
    }
    const item: ScheduleItem = {
      id: randomUUID(),
      scheduleId,
      productId: productId ?? null,
      code: code ?? null,
      quantity: quantity ?? null,
      unitOfMeasure: unitOfMeasure ?? null,
    }
    items.push(item)
    return NextResponse.json({ item }, { status: 201 })
  } catch (error) {
    console.error('Schedule item create error:', error)
    return NextResponse.json({ error: 'Failed to create schedule item' }, { status: 500 })
  }
}
