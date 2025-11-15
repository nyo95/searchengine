import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const { name, sku, brandId, productTypeId, basePrice, attributes } = await req.json()

    if (!name || !sku || !brandId || !productTypeId) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    const product = await db.product.create({
      data: {
        name,
        sku,
        brandId,
        productTypeId,
      },
    })

    return NextResponse.json({ product })
  } catch (error) {
    console.error('[PRODUCTS_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
