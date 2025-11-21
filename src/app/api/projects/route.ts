import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { serializeProject } from '@/server/project-schedule'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')?.trim()

    const where: Prisma.ProjectWhereInput = {}
    if (q) {
      const tokens = q.split(/\s+/).filter(Boolean)
      if (tokens.length) {
        where.AND = tokens.map((token) => ({
          OR: [
            { name: { contains: token, mode: 'insensitive' } },
            { code: { contains: token, mode: 'insensitive' } },
            { clientName: { contains: token, mode: 'insensitive' } },
          ],
        }))
      }
    }

    const projects = await db.project.findMany({
      where,
      include: { _count: { select: { scheduleItems: true } } },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ projects: projects.map(serializeProject) })
  } catch (error) {
    console.error('Projects list error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, code, clientName, location, description } = body as {
      name?: string
      code?: string
      clientName?: string
      location?: string
      description?: string
    }

    if (!name?.trim() || !code?.trim()) {
      return NextResponse.json({ error: 'name and code are required' }, { status: 400 })
    }

    const project = await db.project.create({
      data: {
        name: name.trim(),
        code: code.trim(),
        clientName: clientName?.trim() || null,
        location: location?.trim() || null,
        description: description?.trim() || null,
      },
      include: { _count: { select: { scheduleItems: true } } },
    })

    return NextResponse.json({ project: serializeProject(project) }, { status: 201 })
  } catch (error) {
    console.error('Project create error', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Project code already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
