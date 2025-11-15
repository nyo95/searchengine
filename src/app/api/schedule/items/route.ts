import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { ensureUser } from '@/server/user'

class HttpError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const scheduleId = searchParams.get('scheduleId')
    const userId = searchParams.get('userId')?.trim()

    if (!scheduleId) {
      return NextResponse.json({ error: 'scheduleId is required' }, { status: 400 })
    }

    if (userId) {
      await ensureScheduleOwnership(scheduleId, userId)
    }

    const items = await db.scheduleItem.findMany({
      where: { scheduleId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      items: items.map(serializeScheduleItem),
    })
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Schedule items fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch schedule items' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      scheduleId,
      userId,
      productId,
      variantId,
      brandId,
      productTypeId,
      sku,
      price,
      attributes,
      quantity,
      unitOfMeasure,
      area,
      notes,
    } = body

    if (!scheduleId || !userId || !productId || !brandId || !productTypeId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const normalizedUser = await ensureUser(userId)
    await ensureScheduleOwnership(scheduleId, normalizedUser.id)

    const product = await db.product.findUnique({
      where: { id: productId },
      include: { brand: true, productType: true },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    if (product.brandId !== brandId || product.productTypeId !== productTypeId) {
      return NextResponse.json({ error: 'Product metadata mismatch' }, { status: 400 })
    }

    const newItem = await db.scheduleItem.create({
      data: {
        scheduleId,
        productId,
        variantId,
        productTypeId,
        brandId,
        productName: product.name,
        brandName: product.brand.name,
        sku: sku || product.sku,
        price: typeof price === 'number' ? new Prisma.Decimal(price) : null,
        attributes: attributes || {},
        quantity: quantity ?? 1,
        unitOfMeasure: unitOfMeasure || 'pcs',
        area,
        notes,
      },
    })

    await db.product.update({
      where: { id: productId },
      data: { usageCount: { increment: 1 } },
    })

    // Lightweight learning signal
    await db.userActivity.create({
      data: {
        userId: normalizedUser.id,
        type: 'ADD_TO_SCHEDULE',
        productId,
        variantId,
        brandId,
      } as any,
    })

    return NextResponse.json({ item: serializeScheduleItem(newItem) })
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Schedule item creation error:', error)
    return NextResponse.json({ error: 'Failed to add item to schedule' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('itemId')
    const userId = searchParams.get('userId')?.trim()

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 })
    }

    const item = await db.scheduleItem.findUnique({
      where: { id: itemId },
      select: { id: true, scheduleId: true },
    })

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    if (userId) {
      await ensureScheduleOwnership(item.scheduleId, userId)
    }

    await db.scheduleItem.delete({ where: { id: itemId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Schedule item deletion error:', error)
    return NextResponse.json({ error: 'Failed to delete schedule item' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { itemId, userId, updates } = body as {
      itemId: string
      userId?: string
      updates: Partial<{
        productId: string | null
        productName: string
        brandId: string
        productTypeId: string
        sku: string
        attributes: Record<string, unknown>
        quantity: number
        unitOfMeasure: string
        area: string | null
        notes: string | null
      }>
    }

    if (!itemId || !updates) {
      return NextResponse.json({ error: 'itemId and updates are required' }, { status: 400 })
    }

    const item = await db.scheduleItem.findUnique({ where: { id: itemId } })
    if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 })

    if (userId) {
      await ensureScheduleOwnership(item.scheduleId, userId)
    }

    const dataToUpdate: Prisma.ScheduleItemUpdateInput = {}

    // Validate that 'code' is not being changed if it exists.
    const currentAttributes = item.attributes as any || {}
    const incomingAttributes = updates.attributes as any || {}
    if (currentAttributes.code && incomingAttributes.code && currentAttributes.code !== incomingAttributes.code) {
        return NextResponse.json({ error: "The 'code' field cannot be changed after creation." }, { status: 400 })
    }

    const nextAttributes = { ...currentAttributes, ...incomingAttributes }

    if (updates.brandId) {
      const brand = await db.brand.findUnique({ where: { id: updates.brandId } })
      if (brand) {
        dataToUpdate.brandName = brand.name
        dataToUpdate.brandId = updates.brandId
      }
    }

    if (updates.productTypeId) {
        const productType = await db.productType.findUnique({ where: { id: updates.productTypeId } })
        if (productType) {
            nextAttributes.materialType = productType.name
            dataToUpdate.productTypeId = updates.productTypeId
        }
    }

    if (updates.productId !== undefined) dataToUpdate.productId = updates.productId
    if (updates.productName) dataToUpdate.productName = updates.productName
    if (updates.sku) dataToUpdate.sku = updates.sku
    if (updates.quantity) dataToUpdate.quantity = updates.quantity
    if (updates.unitOfMeasure) dataToUpdate.unitOfMeasure = updates.unitOfMeasure
    if (updates.area !== undefined) dataToUpdate.area = updates.area
    if (updates.notes !== undefined) dataToUpdate.notes = updates.notes
    dataToUpdate.attributes = nextAttributes


    const updated = await db.scheduleItem.update({
      where: { id: itemId },
      data: dataToUpdate,
    })

    return NextResponse.json({ item: serializeScheduleItem(updated) })
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Schedule item update error:', error)
    return NextResponse.json({ error: 'Failed to update schedule item' }, { status: 500 })
  }
}

async function ensureScheduleOwnership(scheduleId: string, userId: string) {
  const schedule = await db.projectSchedule.findUnique({
    where: { id: scheduleId },
    select: { id: true, userId: true },
  })

  if (!schedule) {
    throw new HttpError(404, 'Schedule not found')
  }

  if (schedule.userId !== userId) {
    throw new HttpError(403, 'You do not have access to this schedule')
  }
}

function serializeScheduleItem(item: {
  id: string
  scheduleId: string
  productId: string | null
  variantId: string | null
  productName: string
  brandName: string
  sku: string
  price: Prisma.Decimal | null
  attributes: Record<string, unknown>
  quantity: number
  unitOfMeasure: string
  area: string | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
}) {
  return {
    ...item,
    productId: item.productId,
    price: item.price != null ? Number(item.price) : null,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }
}
