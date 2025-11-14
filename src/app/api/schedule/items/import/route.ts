import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ensureUser } from '@/server/user'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData()
    const scheduleId = String(form.get('scheduleId') || '')
    const userId = String(form.get('userId') || '')
    const file = form.get('file') as File | null

    if (!scheduleId || !userId || !file) {
      return NextResponse.json({ error: 'scheduleId, userId, and file are required' }, { status: 400 })
    }

    const normalizedUser = await ensureUser(userId)
    const schedule = await db.projectSchedule.findUnique({ where: { id: scheduleId } })
    if (!schedule) return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
    if (schedule.userId !== normalizedUser.id)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const text = await file.text()
    const rows = parseCSV(text)
    if (!rows.length) return NextResponse.json({ imported: 0 })

    // Expect headers (from SketchUp plugin):
    // code, thumb, kind_label, brand, subtype, notes, sample_received
    // We also accept legacy headers: material type, type (sku), sku, area, uom, qty
    const header = rows[0].map((h) => h.toLowerCase().trim())
    const idx = {
      // Material Type column from plugin is `kind_label`
      materialType: header.findIndex((h) => /kind_label|material\s*type/i.test(h)),
      brand: header.findIndex((h) => /brand/i.test(h)),
      // SKU column from plugin is `subtype` (a free text Type/SKU)
      sku: header.findIndex((h) => /subtype|sku|type\s*\(sku\)/i.test(h)),
      notes: header.findIndex((h) => /notes?/i.test(h)),
      quantity: header.findIndex((h) => /quantity|qty/i.test(h)),
      uom: header.findIndex((h) => /uom|unit/i.test(h)),
      area: header.findIndex((h) => /area|zone/i.test(h)),
    }

    const dataRows = rows.slice(1).filter((r) => r.some((c) => c && c.trim()))
    let imported = 0

    for (const r of dataRows) {
      const materialType = safeAt(r, idx.materialType)
      const brandName = safeAt(r, idx.brand)
      const sku = safeAt(r, idx.sku)
      const notes = safeAt(r, idx.notes)
      // Qty/UoM tidak dipakai; abaikan di import
      const area = safeAt(r, idx.area) || null

      if (!brandName || !sku) continue

      const { product, brand } = await minimalLinkProduct({ brandName, sku, materialType })

      // Dedup per (scheduleId, brandName, sku)
      const existing = await db.scheduleItem.findFirst({
        where: { scheduleId, brandName: brand.name, sku: product.sku },
        select: { id: true },
      })
      if (!existing) {
        await db.scheduleItem.create({
          data: {
            scheduleId,
            productId: product.id,
            variantId: null,
            productName: product.name,
            brandName: brand.name,
            sku: product.sku,
            price: 0,
            attributes: materialType ? { materialType } : {},
            area,
            notes,
          },
        })
        imported++
      }
    }

    return NextResponse.json({ imported })
  } catch (error) {
    console.error('CSV import error:', error)
    return NextResponse.json({ error: 'Failed to import CSV' }, { status: 500 })
  }
}

function parseCSV(input: string): string[][] {
  const rows: string[][] = []
  let cur = ''
  let row: string[] = []
  let inQuotes = false
  for (let i = 0; i < input.length; i++) {
    const ch = input[i]
    if (ch === '"') {
      const next = input[i + 1]
      if (inQuotes && next === '"') {
        cur += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      row.push(cur)
      cur = ''
    } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (cur.length || row.length) {
        row.push(cur)
        rows.push(row)
        row = []
        cur = ''
      }
    } else {
      cur += ch
    }
  }
  if (cur.length || row.length) {
    row.push(cur)
    rows.push(row)
  }
  return rows
}

function safeAt(arr: string[], idx: number) {
  if (idx < 0) return ''
  return (arr[idx] || '').trim()
}

async function minimalLinkProduct({ brandName, sku, materialType }: { brandName: string; sku: string; materialType?: string }) {
  const catName = classifyCategoryFromType(materialType)
  const category = await db.category.findFirst({ where: { name: catName } })
  const categoryId = category?.id || null

  const brand = await db.brand.upsert({
    where: { name: brandName },
    update: {},
    create: { name: brandName, nameEn: brandName, categoryId: categoryId || (await ensureDefaultMaterialCategory()).id },
  })

  const ptName = materialType || 'Generic'
  let productType = await db.productType.findFirst({ where: { name: ptName, brandId: brand.id } })
  if (!productType) productType = await db.productType.create({ data: { name: ptName, brandId: brand.id } })

  let product = await db.product.findFirst({ where: { sku, brandId: brand.id } })
  if (!product) {
    product = await db.product.create({
      data: {
        sku,
        name: sku,
        productTypeId: productType.id,
        brandId: brand.id,
        categoryId,
      },
    })
  }
  return { product, brand }
}

async function ensureDefaultMaterialCategory() {
  const existing = await db.category.findFirst({ where: { name: 'Material' } })
  if (existing) return existing
  return db.category.create({ data: { name: 'Material', nameEn: 'Material' } })
}

function classifyCategoryFromType(type?: string | null) {
  const t = (type || '').toLowerCase()
  if (/downlight|spotlight|lampu/.test(t)) return 'Lighting'
  if (/chair|furniture|sofa|kursi|meja/.test(t)) return 'Furniture'
  return 'Material'
}
