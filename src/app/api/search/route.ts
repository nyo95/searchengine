import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const category = searchParams.get('category') || ''
    const brand = searchParams.get('brand') || ''
    const minPrice = searchParams.get('minPrice') || ''
    const maxPrice = searchParams.get('maxPrice') || ''
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const userId = searchParams.get('userId') || 'anonymous'

    if (!query.trim()) {
      return NextResponse.json({ products: [], total: 0 })
    }

    // Track search activity
    await trackUserActivity(userId, 'SEARCH', null, null, null, query, {
      category,
      brand,
      minPrice,
      maxPrice
    })

    // For now, use mock data since we don't have PostgreSQL setup yet
    const mockProducts = [
      {
        id: '1',
        name: 'Downlight LED 3W 3000K',
        nameEn: 'Downlight LED 3W 3000K',
        sku: 'PH-DL-3W-30K',
        basePrice: 150000,
        images: ['/api/placeholder/200/200'],
        keywords: ['downlight', 'led', '3000k'],
        viewCount: 245,
        usageCount: 89,
        productTypeName: 'Downlight',
        brandName: 'Philips',
        categoryName: 'Lighting',
        variants: [
          {
            id: 'v1',
            name: 'Warm White',
            attributes: { wattage: '3W', cri: '90', cct: '3000K', beamAngle: '120°' },
            price: 150000
          }
        ]
      },
      {
        id: '2',
        name: 'HPL Taco Walnut',
        nameEn: 'HPL Taco Walnut',
        sku: 'TC-HPL-WNT-001',
        basePrice: 280000,
        images: ['/api/placeholder/200/200'],
        keywords: ['hpl', 'taco', 'walnut'],
        viewCount: 189,
        usageCount: 67,
        productTypeName: 'HPL',
        brandName: 'Taco',
        categoryName: 'Material',
        variants: [
          {
            id: 'v2',
            name: 'Walnut Finish',
            attributes: { thickness: '1.2mm', finish: 'Textured', color: 'Walnut', size: '1220x2440mm' },
            price: 280000
          }
        ]
      }
    ]

    // Simple mock filtering
    let filteredProducts = mockProducts.filter(product => 
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.nameEn.toLowerCase().includes(query.toLowerCase()) ||
      product.brandName.toLowerCase().includes(query.toLowerCase()) ||
      product.sku.toLowerCase().includes(query.toLowerCase()) ||
      product.categoryName.toLowerCase().includes(query.toLowerCase()) ||
      product.keywords.some(keyword => keyword.toLowerCase().includes(query.toLowerCase()))
    )

    // Apply additional filters
    if (category) {
      filteredProducts = filteredProducts.filter(p => 
        p.categoryName.toLowerCase() === category.toLowerCase()
      )
    }

    if (brand) {
      filteredProducts = filteredProducts.filter(p => 
        p.brandName.toLowerCase() === brand.toLowerCase()
      )
    }

    if (minPrice) {
      filteredProducts = filteredProducts.filter(p => p.basePrice >= parseFloat(minPrice))
    }

    if (maxPrice) {
      filteredProducts = filteredProducts.filter(p => p.basePrice <= parseFloat(maxPrice))
    }

    // Sort by relevance (mock: usage count first)
    filteredProducts.sort((a, b) => b.usageCount - a.usageCount)

    const total = filteredProducts.length
    const paginatedProducts = filteredProducts.slice(offset, offset + limit)

    return NextResponse.json({
      products: paginatedProducts,
      total,
      hasMore: offset + limit < total
    })

  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}

// Mock activity tracking for now
async function trackUserActivity(
  userId: string,
  type: string,
  productId?: string,
  variantId?: string,
  brandId?: string,
  searchQuery?: string,
  filters?: any
) {
  console.log('Tracking activity:', { userId, type, productId, searchQuery })
  // In real implementation, this would save to database
}