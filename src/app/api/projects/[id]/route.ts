import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { serializeProject } from '@/server/project-schedule'

type Params = { id: string }

export async function GET(_request: NextRequest, { params }: { params: Promise<Params> }) {
  try {
    const { id } = await params
    const project = await db.project.findUnique({
      where: { id },
      include: { _count: { select: { scheduleItems: true } } },
    })
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }
    return NextResponse.json({ project: serializeProject(project) })
  } catch (error) {
    console.error('Project detail error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<Params> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, code, clientName, location, description } = body as {
      name?: string
      code?: string
      clientName?: string
      location?: string
      description?: string
    }

    const data: Prisma.ProjectUpdateInput = {}
    if (name !== undefined) {
      const nextName = name.trim()
      if (!nextName) return NextResponse.json({ error: 'name cannot be empty' }, { status: 400 })
      data.name = nextName
    }
    if (code !== undefined) {
      const nextCode = code.trim()
      if (!nextCode) return NextResponse.json({ error: 'code cannot be empty' }, { status: 400 })
      data.code = nextCode
    }
    if (clientName !== undefined) data.clientName = clientName?.trim() || null
    if (location !== undefined) data.location = location?.trim() || null
    if (description !== undefined) data.description = description?.trim() || null

    if (!Object.keys(data).length) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const project = await db.project.update({
      where: { id },
      data,
      include: { _count: { select: { scheduleItems: true } } },
    })

    return NextResponse.json({ project: serializeProject(project) })
  } catch (error) {
    console.error('Project update error', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Project code already exists' }, { status: 409 })
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<Params> }) {
  try {
    const { id } = await params
    await db.$transaction([
      db.projectScheduleItem.deleteMany({ where: { projectId: id } }),
      db.project.delete({ where: { id } }),
    ])
    return NextResponse.json({ deleted: true })
  } catch (error) {
    console.error('Project delete error', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
