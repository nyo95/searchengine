import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const MAX_LIMIT = 10

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.trim() ?? ''
    const limit = Math.min(
      Math.max(parseInt(searchParams.get('limit') || '5', 10), 1),
      MAX_LIMIT,
    )

    if (query.length < 2) {
      return NextResponse.json({ suggestions: [] })
    }

    const [synonyms, products, brands, productTypes] = await Promise.all([
      db.searchSynonym.findMany({
        where: {
          OR: [
            { term: { contains: query, mode: 'insensitive' } },
            { synonym: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: { term: true, synonym: true },
        take: limit,
      }),
      db.product.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { nameEn: { contains: query, mode: 'insensitive' } },
            { sku: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: { name: true, nameEn: true, sku: true },
        take: limit,
      }),
      db.brand.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { nameEn: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: { name: true, nameEn: true },
        take: limit,
      }),
      db.productType.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { nameEn: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: { name: true, nameEn: true },
        take: limit,
      }),
    ])

    const suggestions = new Set<string>()

    synonyms.forEach((synonym) => {
      if (synonym.term) suggestions.add(synonym.term)
      if (synonym.synonym) suggestions.add(synonym.synonym)
    })

    products.forEach((product) => {
      suggestions.add(product.name)
      if (product.nameEn) suggestions.add(product.nameEn)
      if (product.sku) suggestions.add(product.sku)
    })

    brands.forEach((brand) => {
      suggestions.add(brand.name)
      if (brand.nameEn) suggestions.add(brand.nameEn)
    })

    productTypes.forEach((type) => {
      suggestions.add(type.name)
      if (type.nameEn) suggestions.add(type.nameEn)
    })

    const orderedSuggestions = Array.from(suggestions)
      .filter(Boolean)
      .sort((a, b) => {
        const aStarts = a.toLowerCase().startsWith(query.toLowerCase()) ? 0 : 1
        const bStarts = b.toLowerCase().startsWith(query.toLowerCase()) ? 0 : 1
        if (aStarts !== bStarts) return aStarts - bStarts
        return a.localeCompare(b)
      })
      .slice(0, limit)

    return NextResponse.json({ suggestions: orderedSuggestions })
  } catch (error) {
    console.error('Suggestions error:', error)
    return NextResponse.json({ error: 'Failed to get suggestions' }, { status: 500 })
  }
}
