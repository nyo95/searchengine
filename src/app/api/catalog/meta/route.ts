import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const [categories, brands] = await Promise.all([
      db.category.findMany({
        select: {
          id: true,
          name: true,
          nameEn: true,
          parentId: true,
          _count: { select: { products: true } },
        },
        orderBy: { name: 'asc' },
      }),
      db.brand.findMany({
        select: {
          id: true,
          name: true,
          nameEn: true,
          _count: { select: { products: true } },
        },
        orderBy: { name: 'asc' },
      }),
    ])

    return NextResponse.json({
      categories: categories.map((category) => ({
        id: category.id,
        name: category.name,
        nameEn: category.nameEn,
        productsCount: category._count.products,
      })),
      brands: brands.map((brand) => ({
        id: brand.id,
        name: brand.name,
        nameEn: brand.nameEn,
        productsCount: brand._count.products,
      })),
    })
  } catch (error) {
    console.error('Catalog meta error:', error)
    return NextResponse.json({ error: 'Failed to fetch catalog metadata' }, { status: 500 })
  }
}
