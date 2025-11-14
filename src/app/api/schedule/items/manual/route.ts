import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { ensureUser } from '@/server/user'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { scheduleId, userId, materialType, brandName, sku, notes } = body as {
      scheduleId: string
      userId: string
      materialType?: string
      brandName: string
      sku: string
      notes?: string
    }

    if (!scheduleId || !userId || !brandName?.trim() || !sku?.trim()) {
      return NextResponse.json({ error: 'scheduleId, userId, brandName, and sku are required' }, { status: 400 })
    }

    const normalizedUser = await ensureUser(userId)
    const schedule = await db.projectSchedule.findUnique({ where: { id: scheduleId } })
    if (!schedule) return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
    if (schedule.userId !== normalizedUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { product, brand } = await minimalLinkProduct({
      brandName: brandName.trim(),
      sku: sku.trim(),
      materialType: materialType?.trim(),
    })

    const existing = await db.scheduleItem.findFirst({
      where: { scheduleId, brandName: brand.name, sku: product.sku },
      select: { id: true },
    })
    if (existing) {
      const existingItem = await db.scheduleItem.findUnique({ where: { id: existing.id } })
      if (existingItem) {
        return NextResponse.json({ item: serializeScheduleItem(existingItem) })
      }
    }

    const newItem = await db.scheduleItem.create({
      data: {
        scheduleId,
        productId: product.id,
        variantId: null,
        productName: product.name,
        brandName: brand.name,
        sku: product.sku,
        price: new Prisma.Decimal(0),
        attributes: materialType ? { materialType } : {},
        quantity: 1,
        unitOfMeasure: 'pcs',
        area: null,
        notes: notes ?? null,
      },
    })

    return NextResponse.json({ item: serializeScheduleItem(newItem) })
  } catch (error) {
    console.error('Manual schedule item create error:', error)
    return NextResponse.json({ error: 'Failed to add manual item' }, { status: 500 })
  }
}

async function minimalLinkProduct({ brandName, sku, materialType }: { brandName: string; sku: string; materialType?: string }) {
  const parentName = classifyCategoryFromType(materialType)

  let parent = await db.category.findFirst({ where: { name: parentName, parentId: null } })
  if (!parent) {
    parent = await db.category.create({
      data: { name: parentName, nameEn: parentName },
    })
  }

  let subcategoryId: string | null = null
  if (materialType && materialType.trim()) {
    let sub = await db.category.findFirst({
      where: { name: materialType.trim(), parentId: parent.id },
    })
    if (!sub) {
      sub = await db.category.create({
        data: { name: materialType.trim(), nameEn: materialType.trim(), parentId: parent.id },
      })
    }
    subcategoryId = sub.id
  }

  const brand = await db.brand.upsert({
    where: { name: brandName },
    update: {},
    create: {
      name: brandName,
      nameEn: brandName,
      categoryId: parent.id,
    },
  })

  if (subcategoryId) {
    await db.brandSubcategory.upsert({
      where: { brandId_subcategoryId: { brandId: brand.id, subcategoryId } },
      update: {},
      create: { brandId: brand.id, subcategoryId },
    })
  }

  const ptName = materialType || 'Generic'
  let productType = await db.productType.findFirst({ where: { name: ptName, brandId: brand.id } })
  if (!productType) {
    productType = await db.productType.create({
      data: {
        name: ptName,
        brandId: brand.id,
        subcategoryId: subcategoryId ?? undefined,
      },
    })
  }

  let product = await db.product.findFirst({ where: { sku, brandId: brand.id } })
  if (!product) {
    product = await db.product.create({
      data: {
        sku,
        name: sku,
        productTypeId: productType.id,
        brandId: brand.id,
        categoryId: subcategoryId ?? parent.id,
      },
    })
  }
  return { product, brand }
}

function classifyCategoryFromType(type?: string | null) {
  const t = (type || '').toLowerCase()
  if (/downlight|spotlight|lampu/.test(t)) return 'Lighting'
  if (/chair|furniture|sofa|kursi|meja/.test(t)) return 'Furniture'
  return 'Material'
}

function serializeScheduleItem(item: {
  id: string
  scheduleId: string
  productId: string
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
