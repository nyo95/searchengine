import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import sharp from 'sharp'
import { promises as fs } from 'node:fs'
import { join } from 'node:path'

export const runtime = 'nodejs'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const form = await request.formData()
    const file = form.get('file') as File | null
    const cx = Number(form.get('cx') || '')
    const cy = Number(form.get('cy') || '')
    const cw = Number(form.get('cw') || '')
    const ch = Number(form.get('ch') || '')
    if (!file) return NextResponse.json({ error: 'file required' }, { status: 400 })

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const uploadsRoot = join(process.cwd(), 'public', 'uploads', 'products', params.id)
    await fs.mkdir(uploadsRoot, { recursive: true })

    const ts = Date.now()
    const baseName = `${ts}`
    const originalPath = join(uploadsRoot, `${baseName}.jpg`)
    const thumbPath = join(uploadsRoot, `${baseName}_thumb.jpg`)

    // Save optimized non-crop
    const optimized = await sharp(buffer).jpeg({ quality: 80 }).toBuffer()
    await fs.writeFile(originalPath, optimized)

    // Determine if a thumbnail exists
    const existingThumb = await db.productMedia.findFirst({
      where: { productId: params.id, type: 'IMAGE', label: 'thumbnail' },
      select: { id: true },
    })

    // Create 1:1 crop for thumbnail only if not exists yet
    if (!existingThumb) {
      let thumb = sharp(buffer)
      // If valid crop rect provided, extract and then resize to 800x800
      if (Number.isFinite(cx) && Number.isFinite(cy) && cw > 0 && ch > 0) {
        try {
          thumb = thumb.extract({ left: Math.max(0, Math.floor(cx)), top: Math.max(0, Math.floor(cy)), width: Math.floor(cw), height: Math.floor(ch) })
        } catch (e) {
          // fallback to center crop
        }
      } else {
        // fallback to center-ish square crop by resizing with cover
      }
      const thumbBuf = await thumb.resize(800, 800, { fit: 'cover' }).jpeg({ quality: 80 }).toBuffer()
      await fs.writeFile(thumbPath, thumbBuf)
      await db.productMedia.create({
        data: {
          productId: params.id,
          type: 'IMAGE',
          url: `/uploads/products/${params.id}/${baseName}_thumb.jpg`,
          label: 'thumbnail',
          metadata: { ratio: '1:1' },
        },
      })
    }

    // Check non-crop count (max 2)
    const nonCropCount = await db.productMedia.count({
      where: { productId: params.id, type: 'IMAGE', NOT: { label: 'thumbnail' } },
    })
    if (nonCropCount >= 2) {
      return NextResponse.json({ error: 'Maximum non-crop images reached (2)' }, { status: 400 })
    }

    const media = await db.productMedia.create({
      data: {
        productId: params.id,
        type: 'IMAGE',
        url: `/uploads/products/${params.id}/${baseName}.jpg`,
        label: 'image',
      },
    })

    return NextResponse.json({ media })
  } catch (error) {
    console.error('Upload media error', error)
    return NextResponse.json({ error: 'Failed to upload media' }, { status: 500 })
  }
}
