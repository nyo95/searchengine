import { NextRequest, NextResponse } from 'next/server'
import { ActivityType } from '@prisma/client'
import { db } from '@/lib/db'

const RANGE_MAP: Record<string, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
  '1y': 365,
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const rangeKey = searchParams.get('range') || '30d'
    const rangeDays = RANGE_MAP[rangeKey] || RANGE_MAP['30d']

    const now = new Date()
    const startDate = new Date(now)
    startDate.setDate(startDate.getDate() - rangeDays)
    const previousStartDate = new Date(startDate)
    previousStartDate.setDate(previousStartDate.getDate() - rangeDays)

    const [
      currentSearches,
      previousSearches,
      totalViews,
      totalSchedules,
      topSearchTerm,
      popularProducts,
      brandUsage,
      categoryUsage,
      searchTrends,
      preferences,
    ] = await Promise.all([
      db.userActivity.count({
        where: {
          type: ActivityType.SEARCH,
          createdAt: { gte: startDate },
        },
      }),
      db.userActivity.count({
        where: {
          type: ActivityType.SEARCH,
          createdAt: { gte: previousStartDate, lt: startDate },
        },
      }),
      db.userActivity.count({
        where: {
          type: ActivityType.VIEW_PRODUCT,
          createdAt: { gte: startDate },
        },
      }),
      db.scheduleItem.count({
        where: { createdAt: { gte: startDate } },
      }),
      db.userActivity.groupBy({
        by: ['searchQuery'],
        where: {
          type: ActivityType.SEARCH,
          searchQuery: { not: null },
          createdAt: { gte: startDate },
        },
        _count: { _all: true },
        orderBy: { _count: { _all: 'desc' } },
        take: 1,
      }),
      db.product.findMany({
        include: {
          productType: { include: { brand: true } },
        },
        orderBy: [
          { usageCount: 'desc' },
          { viewCount: 'desc' },
        ],
        take: 5,
      }),
      db.product.groupBy({
        by: ['brandId'],
        _sum: { usageCount: true },
        orderBy: { _sum: { usageCount: 'desc' } },
        take: 5,
      }),
      db.product.groupBy({
        by: ['categoryId'],
        _sum: { usageCount: true },
        orderBy: { _sum: { usageCount: 'desc' } },
      }),
      db.userActivity.groupBy({
        by: ['searchQuery'],
        where: {
          type: ActivityType.SEARCH,
          searchQuery: { not: null },
          createdAt: { gte: startDate },
        },
        _count: { _all: true },
        orderBy: { _count: { _all: 'desc' } },
        take: 5,
      }),
      db.userPreference.findMany({
        orderBy: { weight: 'desc' },
        take: 5,
      }),
    ])

    const brandIds = brandUsage.map((entry) => entry.brandId).filter(Boolean) as string[]
    const brandDetails = brandIds.length
      ? await db.brand.findMany({
          where: { id: { in: brandIds } },
        })
      : []

    const categoryIds = categoryUsage.map((entry) => entry.categoryId).filter(Boolean) as string[]
    const categoryDetails = categoryIds.length
      ? await db.category.findMany({
          where: { id: { in: categoryIds } },
        })
      : []

    const totalBrandUsage = brandUsage.reduce((sum, entry) => sum + (entry._sum.usageCount || 0), 0) || 1
    const totalCategoryUsage = categoryUsage.reduce((sum, entry) => sum + (entry._sum.usageCount || 0), 0) || 1

    const overviewGrowth =
      previousSearches === 0 ? 100 : ((currentSearches - previousSearches) / previousSearches) * 100

    return NextResponse.json({
      overview: {
        totalSearches: currentSearches,
        totalViews,
        totalSchedules,
        topSearchTerm: topSearchTerm[0]?.searchQuery ?? '',
        growthRate: Number(overviewGrowth.toFixed(1)),
      },
      popularProducts: popularProducts.map((product) => ({
        id: product.id,
        name: product.name,
        brand: product.productType.brand.name,
        views: product.viewCount,
        usage: product.usageCount,
        trend: product.usageCount >= product.viewCount ? 'up' : 'stable',
      })),
      popularBrands: brandUsage.map((entry) => {
        const brand = brandDetails.find((detail) => detail.id === entry.brandId)
        const usage = entry._sum.usageCount || 0
        return {
          id: entry.brandId,
          name: brand?.name ?? 'Unknown',
          count: usage,
          percentage: Number(((usage / totalBrandUsage) * 100).toFixed(1)),
          trend: usage > totalBrandUsage / brandUsage.length ? 'up' : 'stable',
        }
      }),
      categoryUsage: categoryUsage
        .filter((entry) => entry.categoryId)
        .map((entry) => {
          const category = categoryDetails.find((detail) => detail.id === entry.categoryId)
          const usage = entry._sum.usageCount || 0
          return {
            id: entry.categoryId,
            category: category?.name ?? 'Uncategorized',
            count: usage,
            percentage: Number(((usage / totalCategoryUsage) * 100).toFixed(1)),
          }
        }),
      searchTrends: searchTrends
        .filter((trend) => !!trend.searchQuery)
        .map((trend) => ({
          term: trend.searchQuery as string,
          count: trend._count._all,
          trend: trend._count._all >= 5 ? 'up' : 'stable',
        })),
      userPreferences: preferences.map((preference) => ({
        type: preference.type,
        value: preference.value,
        weight: preference.weight,
      })),
    })
  } catch (error) {
    console.error('Insights API error:', error)
    return NextResponse.json({ error: 'Failed to load insights' }, { status: 500 })
  }
}
