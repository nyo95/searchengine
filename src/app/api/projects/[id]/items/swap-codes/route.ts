import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { serializeScheduleItem } from '@/server/project-schedule'

type Params = { id: string }

export async function POST(request: NextRequest, { params }: { params: Params }) {
  try {
    const projectId = params.id
    const body = await request.json()
    const { itemIdA, itemIdB } = body as { itemIdA?: string; itemIdB?: string }

    if (!itemIdA || !itemIdB) {
      return NextResponse.json({ error: 'itemIdA and itemIdB are required' }, { status: 400 })
    }

    const result = await db.$transaction(async (tx) => {
      const [a, b] = await Promise.all([
        tx.projectScheduleItem.findFirst({
          where: { id: itemIdA, projectId },
          include: { product: { include: { brand: true, category: true, subcategory: true } } },
        }),
        tx.projectScheduleItem.findFirst({
          where: { id: itemIdB, projectId },
          include: { product: { include: { brand: true, category: true, subcategory: true } } },
        }),
      ])

      if (!a || !b) {
        throw new Error('NOT_FOUND')
      }

      const tempCode = `${a.code}__swap__${Date.now()}`
      await tx.projectScheduleItem.update({ where: { id: a.id }, data: { code: tempCode } })
      await tx.projectScheduleItem.update({ where: { id: b.id }, data: { code: a.code } })
      await tx.projectScheduleItem.update({ where: { id: a.id }, data: { code: b.code } })

      const [refreshedA, refreshedB] = await Promise.all([
        tx.projectScheduleItem.findUnique({
          where: { id: a.id },
          include: { product: { include: { brand: true, category: true, subcategory: true } } },
        }),
        tx.projectScheduleItem.findUnique({
          where: { id: b.id },
          include: { product: { include: { brand: true, category: true, subcategory: true } } },
        }),
      ])

      return [refreshedA, refreshedB].filter(Boolean)
    })

    if (!result.length || result.length < 2) {
      return NextResponse.json({ error: 'Schedule item not found' }, { status: 404 })
    }

    return NextResponse.json({ items: result.map((item) => serializeScheduleItem(item!)) })
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Schedule item not found' }, { status: 404 })
    }
    console.error('Swap codes error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
