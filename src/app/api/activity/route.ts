import { NextRequest, NextResponse } from 'next/server'
import { ActivityType } from '@prisma/client'
import { db } from '@/lib/db'
import { ensureUser, updatePreferencesFromActivity } from '@/server/user'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      type,
      productId,
      variantId,
      brandId,
      searchQuery,
      filters,
      metadata,
    } = body

    if (!type || !Object.values(ActivityType).includes(type as ActivityType)) {
      return NextResponse.json({ error: 'Invalid activity type' }, { status: 400 })
    }

    const normalizedUser = await ensureUser(userId)

    const [product, variant] = await Promise.all([
      productId
        ? db.product.findUnique({
            where: { id: productId },
            select: { id: true, brandId: true, categoryId: true, brand: { select: { categoryId: true } } },
          })
        : null,
      variantId
        ? db.variant.findUnique({
            where: { id: variantId },
            select: { id: true, attributes: true },
          })
        : null,
    ])

    const activityType = type as ActivityType

    await db.userActivity.create({
      data: {
        userId: normalizedUser.id,
        type: activityType,
        productId,
        variantId,
        brandId: brandId ?? product?.brandId,
        searchQuery,
        filters,
        metadata,
      },
    })

    await updatePreferencesFromActivity(normalizedUser.id, activityType, {
      brandId: brandId ?? product?.brandId ?? undefined,
      categoryId: product?.categoryId ?? product?.brand?.categoryId ?? undefined,
      attributes: variant?.attributes,
      searchQuery,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Activity tracking error:', error)
    return NextResponse.json({ error: 'Failed to track activity' }, { status: 500 })
  }
}
