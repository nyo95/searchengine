import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const productId = params.id

    const items = await db.scheduleItem.findMany({
      where: { productId },
      include: {
        schedule: true,
      },
    })

    const bySchedule = new Map<
      string,
      {
        id: string
        name: string
        description: string | null
        createdAt: Date
        itemCount: number
      }
    >()

    for (const item of items) {
      const s = item.schedule
      const existing = bySchedule.get(s.id)
      if (!existing) {
        bySchedule.set(s.id, {
          id: s.id,
          name: s.name,
          description: s.description ?? null,
          createdAt: s.createdAt,
          itemCount: 1,
        })
      } else {
        bySchedule.set(s.id, { ...existing, itemCount: existing.itemCount + 1 })
      }
    }

    const schedules = Array.from(bySchedule.values()).sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    )

    return NextResponse.json({ schedules })
  } catch (error) {
    console.error('Product usage fetch error', error)
    return NextResponse.json({ error: 'Failed to load product usage' }, { status: 500 })
  }
}

