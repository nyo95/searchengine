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
      // SKU column from plugin adalah `subtype` (free text Type/SKU) atau kolom eksplisit `sku`
      sku: header.findIndex((h) => /subtype|sku|type\s*\(sku\)/i.test(h)),
      code: header.findIndex((h) => /^code$/i.test(h)),
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
      const code = safeAt(r, idx.code)
      const notes = safeAt(r, idx.notes)
      const quantityRaw = safeAt(r, idx.quantity)
      const quantity = quantityRaw ? Number(quantityRaw) || 1 : 1
      const unitOfMeasure = safeAt(r, idx.uom) || 'pcs'
      const area = safeAt(r, idx.area) || null

      const foundProduct = await findProductInCatalog({ brandName, sku })
      const productId = foundProduct?.id || null
      const productTypeId = foundProduct?.productTypeId || null
      const brandId = foundProduct?.brandId || null
      const productName = sku || materialType || code || 'Untitled'

      // Dedup per (scheduleId, code, brandName, sku)
      const existing = await db.scheduleItem.findFirst({
        where: { scheduleId, brandName, sku, attributes: { path: ['code'], equals: code } },
        select: { id: true },
      })

      if (!existing) {
        await db.scheduleItem.create({
          data: {
            scheduleId,
            productId,
            productTypeId,
            brandId,
            productName,
            brandName,
            sku,
            quantity,
            unitOfMeasure,
            area,
            notes,
            attributes: {
              ...(materialType && { materialType }),
              ...(code && { code }),
            },
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

async function findProductInCatalog({ brandName, sku }: { brandName: string; sku: string }): Promise<{ id: string; productTypeId: string; brandId: string } | null> {
    if (!brandName || !sku) {
        return null
    }

    const product = await db.product.findFirst({
        where: {
            sku: {
                equals: sku,
                mode: 'insensitive'
            },
            brand: {
                name: {
                    equals: brandName,
                    mode: 'insensitive'
                }
            }
        },
        select: {
            id: true,
            productTypeId: true,
            brandId: true
        }
    })

    return product ? { id: product.id, productTypeId: product.productTypeId, brandId: product.brandId } : null
}

function classifyCategoryFromType(type?: string | null) {
  const t = (type || '').toLowerCase()
  if (/downlight|spotlight|lampu/.test(t)) return 'Lighting'
  if (/chair|furniture|sofa|kursi|meja/.test(t)) return 'Furniture'
  return 'Material'
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
