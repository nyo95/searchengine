import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { serializeScheduleItem } from '@/server/project-schedule'

type Params = { id: string; itemId: string }

async function loadItem(projectId: string, itemId: string) {
  return db.projectScheduleItem.findFirst({
    where: { id: itemId, projectId },
    include: {
      product: {
        include: {
          brand: true,
          category: true,
          subcategory: true,
        },
      },
    },
  })
}

export async function PATCH(request: NextRequest, { params }: { params: Params }) {
  try {
    const projectId = params.id
    const itemId = params.itemId
    const body = await request.json()
    const { code, area, locationNote, usageNote, sortOrder } = body as {
      code?: string
      area?: string | null
      locationNote?: string | null
      usageNote?: string | null
      sortOrder?: number | null
    }

    const existing = await loadItem(projectId, itemId)
    if (!existing) {
      return NextResponse.json({ error: 'Schedule item not found' }, { status: 404 })
    }

    const data: Prisma.ProjectScheduleItemUpdateInput = {}
    if (code !== undefined) {
      const nextCode = code.trim()
      if (!nextCode) return NextResponse.json({ error: 'code cannot be empty' }, { status: 400 })
      const conflict = await db.projectScheduleItem.findFirst({
        where: { projectId, code: nextCode, NOT: { id: itemId } },
        select: { id: true },
      })
      if (conflict) {
        return NextResponse.json({ error: 'Schedule code already used in this project' }, { status: 409 })
      }
      data.code = nextCode
    }
    if (area !== undefined) data.area = area?.trim() || null
    if (locationNote !== undefined) data.locationNote = locationNote?.trim() || null
    if (usageNote !== undefined) data.usageNote = usageNote?.trim() || null
    if (sortOrder !== undefined) data.sortOrder = sortOrder ?? null

    if (!Object.keys(data).length) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const updated = await db.projectScheduleItem.update({
      where: { id: itemId },
      data,
      include: {
        product: {
          include: {
            brand: true,
            category: true,
            subcategory: true,
          },
        },
      },
    })

    return NextResponse.json({ item: serializeScheduleItem(updated) })
  } catch (error) {
    console.error('Schedule item update error', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Schedule code already used in this project' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Params }) {
  try {
    const projectId = params.id
    const itemId = params.itemId

    const existing = await db.projectScheduleItem.findFirst({
      where: { id: itemId, projectId },
      select: { id: true },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Schedule item not found' }, { status: 404 })
    }

    await db.projectScheduleItem.delete({ where: { id: itemId } })
    return NextResponse.json({ deleted: true })
  } catch (error) {
    console.error('Schedule item delete error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
