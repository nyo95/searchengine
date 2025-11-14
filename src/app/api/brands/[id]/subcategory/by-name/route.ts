import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const name = String(body.name || '').trim()
    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }

    const brand = await db.brand.findUnique({ where: { id: params.id } })
    if (!brand) return NextResponse.json({ error: 'Brand not found' }, { status: 404 })

    // Parent category = brand.categoryId
    let sub = await db.category.findFirst({
      where: { name, parentId: brand.categoryId },
    })
    if (!sub) {
      sub = await db.category.create({
        data: { name, nameEn: name, parentId: brand.categoryId },
      })
    }

    await ensureSubcategorySynonyms(sub.name)

    const link = await db.brandSubcategory.upsert({
      where: { brandId_subcategoryId: { brandId: brand.id, subcategoryId: sub.id } },
      update: {},
      create: { brandId: brand.id, subcategoryId: sub.id },
    })

    return NextResponse.json({ link, subcategory: { id: sub.id, name: sub.name } })
  } catch (e) {
    console.error('Brand subcategory-by-name error', e)
    return NextResponse.json({ error: 'Failed to link subcategory' }, { status: 500 })
  }
}

async function ensureSubcategorySynonyms(name?: string | null) {
  const n = (name || '').trim()
  if (!n) return
  const parts = n.split(/\s+/).filter(Boolean)
  if (parts.length < 2) return
  const slug = parts.map((p) => p[0]).join('').toLowerCase() // e.g. High Pressure Laminate -> hpl
  if (slug.length < 2) return

  const existing = await db.searchSynonym.findFirst({
    where: { term: slug, synonym: n },
  })
  if (!existing) {
    await db.searchSynonym.create({ data: { term: slug, synonym: n } })
    await db.searchSynonym.create({ data: { term: n, synonym: slug } })
  }
}

