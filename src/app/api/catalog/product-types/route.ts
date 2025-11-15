import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(_request: NextRequest) {
  try {
    const productTypes = await db.productType.findMany({
      select: {
        id: true,
        name: true,
        nameEn: true,
        brandId: true,
        subcategoryId: true,
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ productTypes })
  } catch (error) {
    console.error('Product types meta error:', error)
    return NextResponse.json({ error: 'Failed to fetch product types' }, { status: 500 })
  }
}

