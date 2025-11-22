import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const project = await db.project.findUnique({
      where: { id: params.id },
      include: { _count: { select: { scheduleItems: true } } },
    })
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    return NextResponse.json({ project: { ...project, itemCount: project._count.scheduleItems } })
  } catch (error) {
    console.error('Project fetch error', error)
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = await request.json()
    const data: Record<string, any> = {}
    if (payload.name !== undefined) {
      if (!payload.name?.trim()) return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 })
      data.name = payload.name.trim()
    }
    if (payload.clientName !== undefined) {
      data.clientName = payload.clientName?.trim() || null
    }
    if (payload.status !== undefined) {
      data.status = payload.status
    }
    if (payload.budget !== undefined) {
      data.budget = payload.budget ?? null
    }

    if (!Object.keys(data).length) return NextResponse.json({ error: 'No changes provided' }, { status: 400 })

    const project = await db.project.update({
      where: { id: params.id },
      data,
      include: { _count: { select: { scheduleItems: true } } },
    })
    return NextResponse.json({ project: { ...project, itemCount: project._count.scheduleItems } })
  } catch (error) {
    console.error('Project update error', error)
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db.project.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Project delete error', error)
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, ctx: { params: { id: string } }) {
  return PATCH(request, ctx)
}
