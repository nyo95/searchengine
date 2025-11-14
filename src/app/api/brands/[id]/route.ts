import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const brand = await db.brand.findUnique({ where: { id: params.id } })
    if (!brand) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ brand })
  } catch (e) {
    console.error('Brand get error', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { name, nameEn, website, email, contact, description } = body as Partial<{ name: string; nameEn: string; website: string; email: string; contact: string; description: string }>
    const brand = await db.brand.update({
      where: { id: params.id },
      data: { name, nameEn, website, email, contact, description },
    })
    return NextResponse.json({ brand })
  } catch (e) {
    console.error('Brand update error', e)
    return NextResponse.json({ error: 'Failed to update brand' }, { status: 500 })
  }
}

