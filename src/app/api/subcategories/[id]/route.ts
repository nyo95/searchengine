import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const subcategory = await db.subcategory.findUnique({ where: { id: params.id }, include: { category: true } })
    if (!subcategory) return NextResponse.json({ error: 'Subcategory not found' }, { status: 404 })
    return NextResponse.json({ subcategory })
  } catch (error) {
    console.error('Subcategory fetch error', error)
    return NextResponse.json({ error: 'Failed to fetch subcategory' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = await request.json()
    const data: Record<string, any> = {}

    if (payload.name !== undefined) {
      if (!payload.name?.trim()) return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 })
      data.name = payload.name.trim()
    }
    if (payload.prefix !== undefined) {
      if (!payload.prefix?.trim()) return NextResponse.json({ error: 'Prefix cannot be empty' }, { status: 400 })
      data.prefix = payload.prefix.trim()
    }
    if (payload.categoryId !== undefined) {
      data.categoryId = payload.categoryId || null
    }
    if (payload.defaultAttributesTemplate !== undefined) {
      data.defaultAttributesTemplate = payload.defaultAttributesTemplate
    }

    if (!Object.keys(data).length) return NextResponse.json({ error: 'No changes provided' }, { status: 400 })

    const subcategory = await db.subcategory.update({ where: { id: params.id }, data })
    return NextResponse.json({ subcategory })
  } catch (error) {
    console.error('Subcategory update error', error)
    return NextResponse.json({ error: 'Failed to update subcategory' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db.subcategory.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Subcategory delete error', error)
    return NextResponse.json({ error: 'Failed to delete subcategory' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, ctx: { params: { id: string } }) {
  return PATCH(request, ctx)
}
