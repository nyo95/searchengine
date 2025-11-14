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
      // SKU column from plugin is usually `subtype` (a free text Type/SKU),
      // but we also accept `code` or plain `type` when subtype is not present.
      sku: header.findIndex((h) => /subtype|sku|type\s*\(sku\)|^code$|^type$/i.test(h)),
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
      const brandNameRaw = safeAt(r, idx.brand)
      const skuRaw = safeAt(r, idx.sku)
      const code = safeAt(r, idx.code)
      const notes = safeAt(r, idx.notes)
      const quantityRaw = safeAt(r, idx.quantity)
      const quantity = quantityRaw ? Number(quantityRaw) || 1 : 1
      const unitOfMeasure = safeAt(r, idx.uom) || 'pcs'
      const area = safeAt(r, idx.area) || null

      let rowBrand = brandNameRaw
      let rowSku = skuRaw || code
      let productId: string | null = null
      let productName = rowSku || materialType || code || ''

      // Jika brand & sku lengkap, link ke katalog; jika tidak, hanya buat baris schedule tanpa productId
      if (rowBrand && rowSku) {
        const { product, brand } = await minimalLinkProduct({ brandName: rowBrand, sku: rowSku, materialType })
        productId = product.id
        rowBrand = brand.name
        rowSku = product.sku
        productName = product.name
      }

      // Dedup per (scheduleId, brandName, sku) termasuk baris tanpa productId
      const existing = await db.scheduleItem.findFirst({
        where: { scheduleId, brandName: rowBrand || '', sku: rowSku || '' },
        select: { id: true },
      })
      if (!existing) {
        await db.scheduleItem.create({
          data: {
            scheduleId,
            productId,
            variantId: null,
            productName,
            brandName: rowBrand || '',
            sku: rowSku || '',
            price: 0,
            attributes: materialType ? { materialType } : {},
            quantity,
            unitOfMeasure,
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
  const parentName = classifyCategoryFromType(materialType)

  // Parent category (Material / Lighting / Furniture)
  let parent = await db.category.findFirst({ where: { name: parentName, parentId: null } })
  if (!parent) {
    parent = await db.category.create({
      data: { name: parentName, nameEn: parentName },
    })
  }

  // Subcategory based on materialType (e.g. \"High Pressure Laminate\")
  let subcategoryId: string | null = null
  if (materialType && materialType.trim()) {
    let sub = await db.category.findFirst({
      where: { name: materialType.trim(), parentId: parent.id },
    })
    if (!sub) {
      sub = await db.category.create({
        data: { name: materialType.trim(), nameEn: materialType.trim(), parentId: parent.id },
      })
    }
    subcategoryId = sub.id
  }

  const brand = await db.brand.upsert({
    where: { name: brandName },
    update: {},
    create: {
      name: brandName,
      nameEn: brandName,
      categoryId: parent.id,
    },
  })

  // Link brand to subcategory for brand details UI
  if (subcategoryId) {
    await db.brandSubcategory.upsert({
      where: { brandId_subcategoryId: { brandId: brand.id, subcategoryId } },
      update: {},
      create: { brandId: brand.id, subcategoryId },
    })
  }

  const ptName = materialType || 'Generic'
  let productType = await db.productType.findFirst({ where: { name: ptName, brandId: brand.id } })
  if (!productType) {
    productType = await db.productType.create({
      data: {
        name: ptName,
        brandId: brand.id,
        subcategoryId: subcategoryId ?? undefined,
      },
    })
  }

  let product = await db.product.findFirst({ where: { sku, brandId: brand.id } })
  if (!product) {
    product = await db.product.create({
      data: {
        sku,
        name: sku,
        productTypeId: productType.id,
        brandId: brand.id,
        categoryId: subcategoryId ?? parent.id,
      },
    })
  }
  return { product, brand }
}

function classifyCategoryFromType(type?: string | null) {
  const t = (type || '').toLowerCase()
  if (/downlight|spotlight|lampu/.test(t)) return 'Lighting'
  if (/chair|furniture|sofa|kursi|meja/.test(t)) return 'Furniture'
  return 'Material'
}
