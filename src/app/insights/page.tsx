'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TrendingUp, TrendingDown, Eye, Search, ShoppingCart, BarChart3, PieChart, Activity } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'

// Mock analytics data
const mockAnalytics = {
  overview: {
    totalSearches: 1247,
    totalViews: 892,
    totalSchedules: 156,
    topSearchTerm: 'downlight',
    growthRate: 12.5
  },
  popularProducts: [
    { id: '1', name: 'Downlight LED 3W 3000K', brand: 'Philips', views: 245, usage: 89, trend: 'up' },
    { id: '2', name: 'HPL Taco Walnut', brand: 'Taco', views: 189, usage: 67, trend: 'up' },
    { id: '3', name: 'Ergonomic Office Chair', brand: 'Herman Miller', views: 156, usage: 45, trend: 'down' },
    { id: '4', name: 'Spotlight LED 5W', brand: 'Philips', views: 134, usage: 38, trend: 'up' },
    { id: '5', name: 'Vinyl Flooring Wood', brand: 'Local', views: 98, usage: 23, trend: 'stable' }
  ],
  popularBrands: [
    { name: 'Philips', count: 145, percentage: 35, trend: 'up' },
    { name: 'Taco', count: 98, percentage: 24, trend: 'up' },
    { name: 'Herman Miller', count: 67, percentage: 16, trend: 'stable' },
    { name: 'Local Brands', count: 52, percentage: 13, trend: 'up' },
    { name: 'Others', count: 48, percentage: 12, trend: 'down' }
  ],
  categoryUsage: [
    { category: 'Lighting', count: 234, percentage: 45 },
    { category: 'Material', count: 156, percentage: 30 },
    { category: 'Furniture', count: 89, percentage: 17 },
    { category: 'Hardware', count: 43, percentage: 8 }
  ],
  searchTrends: [
    { term: 'downlight', count: 89, trend: 'up' },
    { term: 'HPL', count: 67, trend: 'up' },
    { term: 'chair', count: 45, trend: 'stable' },
    { term: 'lampu sorot', count: 34, trend: 'up' },
    { term: 'vinyl', count: 28, trend: 'down' }
  ],
  userPreferences: [
    { type: 'Brand', value: 'Philips', weight: 8.5 },
    { type: 'Category', value: 'Lighting', weight: 7.2 },
    { type: 'Attribute', value: '3000K', weight: 6.8 },
    { type: 'Brand', value: 'Taco', weight: 5.9 },
    { type: 'Category', value: 'Material', weight: 5.1 }
  ]
}

export default function InsightsPage() {
  const router = useRouter()
  const [analytics] = useState(mockAnalytics)
  const [timeRange, setTimeRange] = useState('30d')

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('id-ID').format(num)
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />
      default:
        return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
                <BarChart3 className="w-4 h-4 mr-2" />
                Back to Search
              </Button>
              <BarChart3 className="w-5 h-5 text-muted-foreground" />
              <h1 className="text-xl font-semibold">Analytics & Insights</h1>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Searches</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(analytics.overview.totalSearches)}</div>
              <p className="text-xs text-muted-foreground">
                +{analytics.overview.growthRate}% from last period
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
              <p className="text-xs text-muted-foreground">
                +8.2% from last period
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Schedule Items</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(analytics.overview.totalSchedules)}</div>
              <p className="text-xs text-muted-foreground">
                +15.3% from last period
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Search</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{analytics.overview.topSearchTerm}</div>
              <p className="text-xs text-muted-foreground">
                Most searched term
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="products">Popular Products</TabsTrigger>
            <TabsTrigger value="brands">Brand Analysis</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="search">Search Trends</TabsTrigger>
            <TabsTrigger value="preferences">User Preferences</TabsTrigger>
          </TabsList>

          {/* Popular Products */}
          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Most Popular Products</CardTitle>
                <CardDescription>
                  Products with highest views and usage in schedules
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
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
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-sm font-medium">{formatNumber(product.views)}</p>
                          <p className="text-xs text-muted-foreground">Views</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium">{formatNumber(product.usage)}</p>
                          <p className="text-xs text-muted-foreground">Usage</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {getTrendIcon(product.trend)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Brand Analysis */}
          <TabsContent value="brands" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Brand Distribution</CardTitle>
                  <CardDescription>
                    Most used brands across all schedules
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.popularBrands.map((brand) => (
                      <div key={brand.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{brand.name}</span>
                            {getTrendIcon(brand.trend)}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {formatNumber(brand.count)} ({brand.percentage}%)
                          </span>
                        </div>
                        <Progress value={brand.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Brand Insights</CardTitle>
                  <CardDescription>
                    Key performance indicators
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium text-green-600">Top Performer</h3>
                      <p className="text-2xl font-bold">Philips</p>
                      <p className="text-sm text-muted-foreground">
                        35% market share, growing trend
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium text-blue-600">Fastest Growing</h3>
                      <p className="text-2xl font-bold">Local Brands</p>
                      <p className="text-sm text-muted-foreground">
                        +45% growth this period
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium text-orange-600">Needs Attention</h3>
                      <p className="text-2xl font-bold">Others</p>
                      <p className="text-sm text-muted-foreground">
                        Declining trend, -12%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Categories */}
          <TabsContent value="categories" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Category Usage</CardTitle>
                <CardDescription>
                  Distribution of product categories in schedules
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {analytics.categoryUsage.map((category) => (
                      <div key={category.category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{category.category}</span>
                          <span className="text-sm text-muted-foreground">
                            {formatNumber(category.count)} ({category.percentage}%)
                          </span>
                        </div>
                        <Progress value={category.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="w-64 h-64 bg-muted rounded-full flex items-center justify-center">
                      <PieChart className="w-32 h-32 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Search Trends */}
          <TabsContent value="search" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Search Trends</CardTitle>
                <CardDescription>
                  Most popular search terms and their trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.searchTrends.map((search, index) => (
                    <div key={search.term} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-medium capitalize">{search.term}</h3>
                          <p className="text-sm text-muted-foreground">
                            {formatNumber(search.count)} searches
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${getTrendColor(search.trend)}`}>
                          {search.trend === 'up' ? '+' : search.trend === 'down' ? '-' : ''}
                          {search.trend === 'up' ? '15%' : search.trend === 'down' ? '8%' : '0%'}
                        </span>
                        {getTrendIcon(search.trend)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Preferences */}
          <TabsContent value="preferences" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Learned User Preferences</CardTitle>
                <CardDescription>
                  System-learned preferences based on user behavior
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.userPreferences.map((pref, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">{pref.type}</Badge>
                        <div>
                          <h3 className="font-medium">{pref.value}</h3>
                          <p className="text-sm text-muted-foreground">
                            Preference weight
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${(pref.weight / 10) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{pref.weight}/10</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h3 className="font-medium mb-2">How Learning Works</h3>
                  <p className="text-sm text-muted-foreground">
                    The system tracks your search patterns, product views, and schedule additions 
                    to learn your preferences. Products matching your preferences appear higher 
                    in search results. The more you interact with certain brands, categories, 
                    or attributes, the stronger the preference becomes.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}