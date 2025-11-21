import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { serializeScheduleItem } from '@/server/project-schedule'

type Params = { id: string }

function buildItemFilters(searchParams: URLSearchParams): Prisma.ProjectScheduleItemWhereInput {
  const brandId = searchParams.get('brandId')?.trim() || undefined
  const categoryId = searchParams.get('categoryId')?.trim() || undefined
  const subcategoryId = searchParams.get('subcategoryId')?.trim() || undefined
  const q = searchParams.get('q')?.trim()

  const where: Prisma.ProjectScheduleItemWhereInput = {}
  if (brandId || categoryId || subcategoryId) {
    where.product = {}
    if (brandId) where.product.brandId = brandId
    if (categoryId) where.product.categoryId = categoryId
    if (subcategoryId) where.product.subcategoryId = subcategoryId
  }

  if (q) {
    const tokens = q.split(/\s+/).filter(Boolean)
    if (tokens.length) {
      where.AND = tokens.map((token) => ({
        OR: [
          { code: { contains: token, mode: 'insensitive' } },
          { area: { contains: token, mode: 'insensitive' } },
          { product: { name: { contains: token, mode: 'insensitive' } } },
          { product: { sku: { contains: token, mode: 'insensitive' } } },
          { product: { internalCode: { contains: token, mode: 'insensitive' } } },
        ],
      }))
    }
  }

  return where
}

export async function GET(request: NextRequest, { params }: { params: Params }) {
  try {
    const projectId = params.id
    const project = await db.project.findUnique({ where: { id: projectId } })
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const where = buildItemFilters(searchParams)
    where.projectId = projectId

    const items = await db.projectScheduleItem.findMany({
      where,
      include: {
        product: {
          include: {
            brand: true,
            category: true,
            subcategory: true,
          },
        },
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    })

    return NextResponse.json({ items: items.map(serializeScheduleItem) })
  } catch (error) {
    console.error('Schedule items list error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Params }) {
  try {
    const projectId = params.id
    const body = await request.json()
    const { productId, code, area, locationNote, usageNote, sortOrder } = body as {
      productId?: string
      code?: string
      area?: string | null
      locationNote?: string | null
      usageNote?: string | null
      sortOrder?: number | null
    }

    if (!productId) {
      return NextResponse.json({ error: 'productId is required' }, { status: 400 })
    }

    const created = await db.$transaction(async (tx) => {
      const project = await tx.project.findUnique({ where: { id: projectId } })
      if (!project) {
        throw new Error('PROJECT_NOT_FOUND')
      }

      const product = await tx.product.findUnique({
        where: { id: productId },
        include: { brand: true, category: true, subcategory: true },
      })
      if (!product) {
        throw new Error('PRODUCT_NOT_FOUND')
      }

      const scheduleCode = (code?.trim() || product.internalCode).trim()
      if (!scheduleCode) {
        throw new Error('CODE_REQUIRED')
      }

      const existing = await tx.projectScheduleItem.findFirst({
        where: { projectId, code: scheduleCode },
        select: { id: true },
      })
      if (existing) {
        throw new Error('CODE_CONFLICT')
      }

      return tx.projectScheduleItem.create({
        data: {
          projectId,
          productId,
          code: scheduleCode,
          area: area?.trim() || null,
          locationNote: locationNote?.trim() || null,
          usageNote: usageNote?.trim() || null,
          sortOrder: sortOrder ?? null,
        },
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
    })

    return NextResponse.json({ item: serializeScheduleItem(created) }, { status: 201 })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'PROJECT_NOT_FOUND') {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 })
      }
      if (error.message === 'PRODUCT_NOT_FOUND') {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }
      if (error.message === 'CODE_REQUIRED') {
        return NextResponse.json({ error: 'Schedule code is required' }, { status: 400 })
      }
      if (error.message === 'CODE_CONFLICT') {
        return NextResponse.json({ error: 'Schedule code already used in this project' }, { status: 409 })
      }
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Schedule code already used in this project' }, { status: 409 })
    }
    console.error('Schedule item create error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
