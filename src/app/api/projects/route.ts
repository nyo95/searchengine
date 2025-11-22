import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')?.trim()

    const projects = await db.project.findMany({
      where: q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { clientName: { contains: q, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { scheduleItems: true } } },
    })

    return NextResponse.json({
      projects: projects.map((project) => ({
        ...project,
        itemCount: project._count?.scheduleItems ?? 0,
      })),
    })
  } catch (error) {
    console.error('Projects fetch error', error)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    if (!payload.name?.trim()) return NextResponse.json({ error: 'Project name is required' }, { status: 400 })

    const project = await db.project.create({
      data: {
        name: payload.name.trim(),
        clientName: payload.clientName?.trim() || null,
        status: payload.status ?? 'PLANNING',
        budget: payload.budget ?? null,
      },
      include: { _count: { select: { scheduleItems: true } } },
    })

    return NextResponse.json({ project: { ...project, itemCount: project._count.scheduleItems } })
  } catch (error) {
    console.error('Project create error', error)
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}
