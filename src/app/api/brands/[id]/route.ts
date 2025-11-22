import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface BrandUpdatePayload {
  name?: string | null
  salesContactName?: string | null
  salesContactPhone?: string | null
}

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const brand = await db.brand.findUnique({ where: { id: params.id } })
    if (!brand) return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
    return NextResponse.json({ brand })
  } catch (error) {
    console.error('Brand fetch error', error)
    return NextResponse.json({ error: 'Failed to fetch brand' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload: BrandUpdatePayload = await request.json()
    const data: Record<string, string> = {}

    if (payload.name !== undefined) {
      if (!payload.name?.trim()) return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 })
      data.name = payload.name.trim()
    }
    if (payload.salesContactName !== undefined) {
      if (!payload.salesContactName?.trim())
        return NextResponse.json({ error: 'Sales contact name cannot be empty' }, { status: 400 })
      data.salesContactName = payload.salesContactName.trim()
    }
    if (payload.salesContactPhone !== undefined) {
      if (!payload.salesContactPhone?.trim())
        return NextResponse.json({ error: 'Sales contact phone cannot be empty' }, { status: 400 })
      data.salesContactPhone = payload.salesContactPhone.trim()
    }

    if (!Object.keys(data).length) {
      return NextResponse.json({ error: 'No changes provided' }, { status: 400 })
    }

    const brand = await db.brand.update({ where: { id: params.id }, data })
    return NextResponse.json({ brand })
  } catch (error) {
    console.error('Brand update error', error)
    return NextResponse.json({ error: 'Failed to update brand' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db.brand.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Brand delete error', error)
    return NextResponse.json({ error: 'Failed to delete brand' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, ctx: { params: { id: string } }) {
  return PATCH(request, ctx)
}
