import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

type CreateBrandPayload = {
  name: string
  website?: string
  phone?: string
  salesName?: string
  salesContact?: string
  isActive?: boolean
}

type UpdateBrandPayload = Partial<CreateBrandPayload>

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'
    const search = searchParams.get('search')?.trim()

    const where: Record<string, unknown> = {}
    if (!includeInactive) where.isActive = true
    if (search) {
      where.name = { contains: search, mode: 'insensitive' }
    }

    const brands = await db.brand.findMany({
      where: where as any,
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
    const payload: CreateBrandPayload = await request.json()
    const { name, website, phone, salesName, salesContact, isActive } = payload

    if (!name?.trim()) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }

    const brand = await db.brand.create({
      data: {
        name: name.trim(),
        website: website?.trim() || null,
        phone: phone?.trim() || null,
        salesName: salesName?.trim() || null,
        salesContact: salesContact?.trim() || null,
        isActive: isActive ?? true,
      },
    })

    return NextResponse.json({ brand })
  } catch (error) {
    console.error('Brand create error', error)
    return NextResponse.json({ error: 'Failed to create brand' }, { status: 500 })
  }
}
