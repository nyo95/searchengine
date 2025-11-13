'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Activity, BarChart3, Eye, PieChart, Search, ShoppingCart, TrendingDown, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'

type AnalyticsResponse = {
  overview: {
    totalSearches: number
    totalViews: number
    totalSchedules: number
    topSearchTerm: string
    growthRate: number
  }
  popularProducts: Array<{ id: string; name: string; brand: string; views: number; usage: number; trend: 'up' | 'down' | 'stable' }>
  popularBrands: Array<{ id?: string; name: string; count: number; percentage: number; trend: 'up' | 'down' | 'stable' }>
  categoryUsage: Array<{ id?: string; category: string; count: number; percentage: number }>
  searchTrends: Array<{ term: string; count: number; trend: 'up' | 'down' | 'stable' }>
  userPreferences: Array<{ type: string; value: string; weight: number }>
}

export default function InsightsPage() {
  const router = useRouter()
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null)
  const [timeRange, setTimeRange] = useState('30d')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/insights?range=${timeRange}`)
      if (!response.ok) throw new Error('Failed to load insights')
      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error(error)
      setAnalytics(null)
    } finally {
      setLoading(false)
    }
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />
      default:
        return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  const formatNumber = (value: number) => new Intl.NumberFormat('id-ID').format(value)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Back to Search
            </Button>
            <h1 className="text-xl font-semibold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-muted-foreground" />
              Analytics & Insights
            </h1>
          </div>
          <select
            value={timeRange}
            onChange={(event) => setTimeRange(event.target.value)}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {loading ? (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">Loading insights...</CardContent>
          </Card>
        ) : analytics ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Searches</CardTitle>
                  <Search className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(analytics.overview.totalSearches)}</div>
                  <p className="text-xs text-muted-foreground">
                    {analytics.overview.growthRate >= 0 ? '+' : ''}
                    {analytics.overview.growthRate}% growth
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Product Views</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(analytics.overview.totalViews)}</div>
                  <p className="text-xs text-muted-foreground">Within selected period</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Schedule Items</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(analytics.overview.totalSchedules)}</div>
                  <p className="text-xs text-muted-foreground">Items captured in schedules</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Top Search</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold capitalize">{analytics.overview.topSearchTerm || '—'}</div>
                  <p className="text-xs text-muted-foreground">Most used term</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue='products' className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="products">Popular Products</TabsTrigger>
                <TabsTrigger value="brands">Brand Analysis</TabsTrigger>
                <TabsTrigger value="categories">Categories</TabsTrigger>
                <TabsTrigger value="search">Search Trends</TabsTrigger>
                <TabsTrigger value="preferences">User Preferences</TabsTrigger>
              </TabsList>

              <TabsContent value="products" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Most Popular Products</CardTitle>
                    <CardDescription>Highest view & schedule usage</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {analytics.popularProducts.map((product, index) => (
                      <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="font-medium">{product.name}</h3>
                            <p className="text-sm text-muted-foreground">{product.brand}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <div>
                            <p className="text-muted-foreground">Views</p>
                            <p className="font-semibold">{product.views}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Schedules</p>
                            <p className="font-semibold">{product.usage}</p>
                          </div>
                          {getTrendIcon(product.trend)}
                        </div>
                      </div>
                    ))}
                    {!analytics.popularProducts.length && (
                      <p className="text-sm text-muted-foreground">No product activity recorded yet.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="brands" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Brand Performance</CardTitle>
                    <CardDescription>Top brands ranked by schedule usage</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {analytics.popularBrands.map((brand) => (
                      <div key={brand.name} className="flex items-center justify-between border rounded-lg p-4">
                        <div>
                          <p className="font-semibold">{brand.name}</p>
                          <p className="text-xs text-muted-foreground">{brand.count} occurrences</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Progress value={brand.percentage} className="w-32" />
                          <span className="text-sm font-medium">{brand.percentage}%</span>
                          {getTrendIcon(brand.trend)}
                        </div>
                      </div>
                    ))}
                    {!analytics.popularBrands.length && (
                      <p className="text-sm text-muted-foreground">No brand metrics available.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="categories" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Category Usage</CardTitle>
                    <CardDescription>Distribution across catalog categories</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {analytics.categoryUsage.map((category) => (
                      <div key={category.category} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <p className="font-medium">{category.category}</p>
                          <p className="text-muted-foreground">
                            {category.count} items ({category.percentage}%)
                          </p>
                        </div>
                        <Progress value={category.percentage} />
                      </div>
                    ))}
                    {!analytics.categoryUsage.length && (
                      <p className="text-sm text-muted-foreground">No category usage captured.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="search" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Search Trends</CardTitle>
                    <CardDescription>Top query terms by volume</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {analytics.searchTrends.map((trend) => (
                      <div key={trend.term} className="flex items-center justify-between border rounded-lg p-4">
                        <div>
                          <p className="font-semibold capitalize">{trend.term}</p>
                          <p className="text-xs text-muted-foreground">{trend.count} searches</p>
                        </div>
                        {getTrendIcon(trend.trend)}
                      </div>
                    ))}
                    {!analytics.searchTrends.length && (
                      <p className="text-sm text-muted-foreground">No search activity recorded.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preferences" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Learned Preferences</CardTitle>
                    <CardDescription>Signals captured by the learning engine</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analytics.userPreferences.map((preference) => (
                      <Card key={`${preference.type}-${preference.value}`}>
                        <CardContent className="p-4 space-y-2">
                          <p className="text-xs uppercase text-muted-foreground">{preference.type}</p>
                          <p className="text-lg font-semibold">{preference.value}</p>
                          <Badge variant="secondary">Weight {preference.weight.toFixed(1)}</Badge>
                        </CardContent>
                      </Card>
                    ))}
                    {!analytics.userPreferences.length && (
                      <p className="text-sm text-muted-foreground">No preferences captured yet.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              Failed to load analytics. Please try a different time range.
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
