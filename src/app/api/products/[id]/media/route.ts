import { NextRequest, NextResponse } from 'next/server'
import { MediaType } from '@prisma/client'
import { db } from '@/lib/db'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { url, type = 'IMAGE', label } = body as { url: string; type?: MediaType; label?: string }
    if (!url) return NextResponse.json({ error: 'url required' }, { status: 400 })
    const media = await db.productMedia.create({ data: { productId: params.id, url, type, label } })
    return NextResponse.json({ media })
  } catch (error) {
    console.error('Add media error', error)
    return NextResponse.json({ error: 'Failed to add media' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { mediaId, label } = body as { mediaId?: string; label?: string }
    if (!mediaId) return NextResponse.json({ error: 'mediaId required' }, { status: 400 })

    const media = await db.productMedia.update({
      where: { id: mediaId, productId: params.id },
      data: typeof label === 'string' ? { label } : {},
    })

    return NextResponse.json({ media })
  } catch (error) {
    console.error('Update media error', error)
    return NextResponse.json({ error: 'Failed to update media' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const mediaId = searchParams.get('mediaId')
    if (!mediaId) return NextResponse.json({ error: 'mediaId required' }, { status: 400 })

    await db.productMedia.delete({
      where: { id: mediaId, productId: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete media error', error)
    return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 })
  }
}

