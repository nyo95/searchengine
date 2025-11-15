import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(request: NextRequest, { params }: { params: { id: string; subcategoryId: string } }) {
  try {
    const body = await request.json()
    const { salesEmail, salesContact } = body as { salesEmail?: string; salesContact?: string }

    const pivot = await db.brandSubcategory.upsert({
      where: { brandId_subcategoryId: { brandId: params.id, subcategoryId: params.subcategoryId } },
      update: { salesEmail, salesContact },
      create: { brandId: params.id, subcategoryId: params.subcategoryId, salesEmail, salesContact },
    })
    return NextResponse.json({ link: pivot })
  } catch (e) {
    console.error('Brand subcategory update error', e)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}

