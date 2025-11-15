import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

type CreateProductPayload = {
  sku: string
  name: string
  nameEn?: string
  description?: string
  brandId: string
  productTypeId: string
  categoryId?: string | null
  basePrice?: number | null
  keywords?: string[] | string
}

export async function POST(req: Request) {
  try {
    const payload: CreateProductPayload = await req.json()
    const { sku, name, nameEn, description, brandId, productTypeId, categoryId, basePrice, keywords } = payload

    if (!sku?.trim() || !name?.trim() || !brandId?.trim() || !productTypeId?.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const brand = await db.brand.findUnique({ where: { id: brandId } })
    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
    }

    const productType = await db.productType.findUnique({
      where: { id: productTypeId },
      include: {
        subcategory: {
          select: { id: true, parentId: true },
        },
      },
    })

    if (!productType) {
      return NextResponse.json({ error: 'Product type not found' }, { status: 404 })
    }

    const resolvedCategoryId =
      categoryId ??
      productType.subcategory?.parentId ??
      productType.subcategory?.id ??
      brand.categoryId ??
      null

    const normalizedKeywords = Array.isArray(keywords)
      ? keywords.map((keyword) => String(keyword).trim()).filter(Boolean)
      : typeof keywords === 'string'
        ? keywords.split(',').map((keyword) => keyword.trim()).filter(Boolean)
        : []

    const product = await db.product.create({
      data: {
        sku: sku.trim(),
        name: name.trim(),
        nameEn: nameEn?.trim() || null,
        description: typeof description === 'string' ? description : null,
        brandId,
        productTypeId,
        categoryId: resolvedCategoryId,
        basePrice: typeof basePrice === 'number' ? new Prisma.Decimal(basePrice) : undefined,
        keywords: normalizedKeywords,
      },
    })

    return NextResponse.json({ product })
  } catch (error) {
    console.error('[PRODUCTS_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
