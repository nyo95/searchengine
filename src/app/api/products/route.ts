import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { normalizeDisplayName, normalizeLookupKey } from '@/lib/catalog-utils'
import {
  findOrCreateCategory,
  findOrCreateSubcategory,
  generateInternalCode,
} from '@/lib/product-service'
import { serializeProduct } from '@/lib/serializers/product'

type CreateProductPayload = {
  sku: string
  name: string
  brandId: string
  categoryName: string
  subcategoryName: string
  description?: string
  imageUrl?: string
  dynamicAttributes?: Record<string, unknown>
  isActive?: boolean
  tags?: string[]
}

export async function POST(request: NextRequest) {
  try {
    const payload: CreateProductPayload = await request.json()
    const {
      sku,
      name,
      brandId,
      categoryName,
      subcategoryName,
      dynamicAttributes,
      description,
      imageUrl,
      isActive,
      tags,
    } = payload

    if (!sku?.trim() || !name?.trim() || !brandId?.trim() || !categoryName?.trim() || !subcategoryName?.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const trimmedSku = sku.trim()
    const normalizedTags = (tags || []).map((tag) => normalizeLookupKey(tag)).filter(Boolean)

    const product = await db.$transaction(async (tx) => {
      const brand = await tx.brand.findUnique({ where: { id: brandId } })
      if (!brand) {
        throw new Error('BRAND_NOT_FOUND')
      }

      const category = await findOrCreateCategory(categoryName, tx)
      const subcategory = await findOrCreateSubcategory(category.id, subcategoryName, tx)
      const prefix = subcategory.prefix || subcategory.name

      const existing = await tx.product.findUnique({
        where: { sku: trimmedSku },
        include: { brand: true, category: true, subcategory: true },
      })

      if (existing) {
        if (!existing.isActive) {
          const needsNewCode = existing.subcategoryId !== subcategory.id
          const internalCode = needsNewCode
            ? await generateInternalCode(subcategory.id, prefix, tx)
            : existing.internalCode
          return tx.product.update({
            where: { id: existing.id },
            data: {
              name: normalizeDisplayName(name),
              brandId,
              categoryId: category.id,
              subcategoryId: subcategory.id,
              internalCode,
              description: description?.trim() || null,
              imageUrl: imageUrl?.trim() || null,
              dynamicAttributes: dynamicAttributes ?? null,
              isActive: true,
              tags: normalizedTags,
            },
            include: {
              brand: true,
              category: true,
              subcategory: true,
            },
          })
        }
        throw new Error('SKU_CONFLICT')
      }

      const internalCode = await generateInternalCode(subcategory.id, prefix, tx)

      return tx.product.create({
        data: {
          sku: trimmedSku,
          name: normalizeDisplayName(name),
          brandId,
          categoryId: category.id,
          subcategoryId: subcategory.id,
          internalCode,
          description: description?.trim() || null,
          imageUrl: imageUrl?.trim() || null,
          dynamicAttributes: dynamicAttributes ?? null,
          isActive: isActive ?? true,
          tags: normalizedTags,
        },
        include: {
          brand: true,
          category: true,
          subcategory: true,
        },
      })
    })

    return NextResponse.json({ product: serializeProduct(product) }, { status: product.createdAt === product.updatedAt ? 201 : 200 })
  } catch (error) {
    console.error('Product create error', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      if (Array.isArray(error.meta?.target) && error.meta?.target.includes('sku')) {
        return NextResponse.json({ error: 'SKU already exists' }, { status: 409 })
      }
      if (Array.isArray(error.meta?.target) && error.meta?.target.includes('internalCode')) {
        return NextResponse.json({ error: 'Internal code already exists' }, { status: 409 })
      }
    }
    if (error instanceof Error) {
      if (error.message === 'BRAND_NOT_FOUND') {
        return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
      }
      if (error.message === 'SKU_CONFLICT') {
        return NextResponse.json({ error: 'SKU already exists' }, { status: 409 })
      }
    }
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
