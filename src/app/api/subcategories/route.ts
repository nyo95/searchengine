import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const subcategories = await db.subcategory.findMany({
      include: { category: true },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json({ subcategories })
  } catch (error) {
    console.error('Subcategory fetch error', error)
    return NextResponse.json({ error: 'Failed to fetch subcategories' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    const name = payload?.name?.trim()
    const prefix = payload?.prefix?.trim()

    if (!name || !prefix) {
      return NextResponse.json({ error: 'Name and prefix are required' }, { status: 400 })
    }

    const subcategory = await db.subcategory.create({
      data: {
        name,
        prefix,
        categoryId: payload.categoryId || null,
        defaultAttributesTemplate: payload.defaultAttributesTemplate ?? null,
      },
    })
    return NextResponse.json({ subcategory })
  } catch (error) {
    console.error('Subcategory create error', error)
    return NextResponse.json({ error: 'Failed to create subcategory' }, { status: 500 })
  }
}
