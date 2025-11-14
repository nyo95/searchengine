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

