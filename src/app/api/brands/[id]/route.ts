import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

type UpdateBrandPayload = {
  name?: string
  website?: string | null
  phone?: string | null
  salesName?: string | null
  salesContact?: string | null
  isActive?: boolean
}

async function applyUpdate(id: string, payload: UpdateBrandPayload) {
  const updateData: Record<string, unknown> = {}
  if (payload.name !== undefined) {
    if (!payload.name.trim()) {
      throw new Error('name cannot be empty')
    }
    updateData.name = payload.name.trim()
  }
  if (payload.website !== undefined) {
    updateData.website = payload.website?.trim() || null
  }
  if (payload.phone !== undefined) {
    updateData.phone = payload.phone?.trim() || null
  }
  if (payload.salesName !== undefined) {
    updateData.salesName = payload.salesName?.trim() || null
  }
  if (payload.salesContact !== undefined) {
    updateData.salesContact = payload.salesContact?.trim() || null
  }
  if (payload.isActive !== undefined) {
    updateData.isActive = payload.isActive
  }
  if (!Object.keys(updateData).length) {
    throw new Error('No changes provided')
  }
  return db.brand.update({
    where: { id },
    data: updateData,
  })
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
    const payload: UpdateBrandPayload = await request.json()
    const brand = await applyUpdate(params.id, payload)
    return NextResponse.json({ brand })
  } catch (error: any) {
    const message = error?.message || 'Failed to update brand'
    const status = message === 'No changes provided' || message === 'name cannot be empty' ? 400 : 500
    console.error('Brand update error', error)
    return NextResponse.json({ error: message }, { status })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  return PATCH(request, { params })
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db.brand.update({
      where: { id: params.id },
      data: { isActive: false },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Brand delete error', error)
    return NextResponse.json({ error: 'Failed to delete brand' }, { status: 500 })
  }
}
