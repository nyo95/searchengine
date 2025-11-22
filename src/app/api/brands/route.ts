import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface BrandPayload {
  name: string
  salesContactName: string
  salesContactPhone: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')?.trim()

    const brands = await db.brand.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { salesContactName: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ brands })
  } catch (error) {
    console.error('Brands fetch error', error)
    return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload: Partial<BrandPayload> = await request.json()
    if (!payload.name?.trim())
      return NextResponse.json({ error: 'Brand name is required' }, { status: 400 })
    if (!payload.salesContactName?.trim())
      return NextResponse.json({ error: 'Sales contact name is required' }, { status: 400 })
    if (!payload.salesContactPhone?.trim())
      return NextResponse.json({ error: 'Sales contact phone is required' }, { status: 400 })

    const brand = await db.brand.create({
      data: {
        name: payload.name.trim(),
        salesContactName: payload.salesContactName.trim(),
        salesContactPhone: payload.salesContactPhone.trim(),
      },
    })

    return NextResponse.json({ brand })
  } catch (error) {
    console.error('Brand create error', error)
    return NextResponse.json({ error: 'Failed to create brand' }, { status: 500 })
  }
}
