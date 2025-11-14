import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')?.trim() || ''
    const categoryId = searchParams.get('categoryId')?.trim() || undefined
    const subcategoryId = searchParams.get('subcategoryId')?.trim() || undefined

    const where: any = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nameEn: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (categoryId) {
      where.categoryId = categoryId
    }

    const brands = await db.brand.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        subcategories: { include: { subcategory: true } },
        _count: { select: { products: true, productTypes: true } },
      },
    })

    const rows = brands
      .filter((b) => {
        if (!subcategoryId) return true
        return b.subcategories.some((s) => s.subcategoryId === subcategoryId)
      })
      .map((b) => ({
        id: b.id,
        name: b.name,
        nameEn: b.nameEn,
        website: b.website,
        email: b.email,
        contact: b.contact,
        categoryId: b.categoryId,
        subcategories: b.subcategories.map((s) => ({
          id: s.subcategory.id,
          name: s.subcategory.name,
          salesEmail: s.salesEmail,
          salesContact: s.salesContact,
        })),
        productsCount: b._count.products,
      }))

    return NextResponse.json({ brands: rows })
  } catch (e) {
    console.error('Brands list error', e)
    return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, nameEn, categoryId, website, email, contact } = body as {
      name: string
      nameEn?: string
      categoryId: string
      website?: string
      email?: string
      contact?: string
    }

    if (!name?.trim() || !categoryId?.trim()) {
      return NextResponse.json({ error: 'name and categoryId are required' }, { status: 400 })
    }

    const brand = await db.brand.create({
      data: {
        name: name.trim(),
        nameEn: nameEn?.trim() || name.trim(),
        categoryId,
        website: website?.trim() || null,
        email: email?.trim() || null,
        contact: contact?.trim() || null,
      },
    })

    return NextResponse.json({ brand })
  } catch (e) {
    console.error('Brand create error', e)
    return NextResponse.json({ error: 'Failed to create brand' }, { status: 500 })
  }
}
