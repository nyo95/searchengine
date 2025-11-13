'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Eye, Filter, Loader2, Package, RefreshCw, Search, TrendingUp } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { useSchedules } from '@/hooks/use-schedules'
import { AddToScheduleDialog } from '@/components/schedule/add-to-schedule-dialog'

type CategoryOption = {
  id: string
  name: string
  nameEn?: string
  productsCount: number
}

type BrandOption = {
  id: string
  name: string
  nameEn?: string
  productsCount: number
}

type VariantSummary = {
  id: string
  name: string
  price: number | null
  attributes: Record<string, unknown>
}

type SearchResultProduct = {
  id: string
  name: string
  nameEn?: string | null
  brandName: string
  categoryName?: string
  productTypeName: string
  sku: string
  basePrice?: number | null
  priceRange?: { min: number | null; max: number | null }
  variants: VariantSummary[]
  primaryImage?: string
  usageCount: number
  viewCount: number
}

type TrendingProduct = {
  id: string
  name: string
  brand: { name: string }
  categoryName?: string
  primaryImage?: string
  priceRange?: { min: number | null; max: number | null }
}

const USER_ID = 'anonymous'
const SEARCH_LIMIT = 12

export default function HomePage() {
  const router = useRouter()
  const { toast } = useToast()
  const searchInputRef = useRef<HTMLInputElement>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResultProduct[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [showFilters, setShowFilters] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [brands, setBrands] = useState<BrandOption[]>([])
  const [trendingProducts, setTrendingProducts] = useState<TrendingProduct[]>([])
  const [loadingSearch, setLoadingSearch] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const [lastQuery, setLastQuery] = useState('')
  const [totalResults, setTotalResults] = useState(0)

  const { schedules, isLoading: isScheduleLoading, refresh: refreshSchedules } = useSchedules(USER_ID)

  useEffect(() => {
    fetchCatalogMeta()
    fetchTrendingProducts()
  }, [])

  const performSearch = useCallback(
    async (query: string, nextOffset = 0, append = false) => {
      if (!query.trim()) {
        setSearchResults([])
        setHasMore(false)
        setTotalResults(0)
        return
      }

      setLoadingSearch(true)
      try {
        const params = new URLSearchParams({
          q: query,
          userId: USER_ID,
          limit: SEARCH_LIMIT.toString(),
          offset: nextOffset.toString(),
        })

        if (selectedCategory) params.set('category', selectedCategory)
        if (selectedBrand) params.set('brand', selectedBrand)
        if (priceRange.min) params.set('minPrice', priceRange.min)
        if (priceRange.max) params.set('maxPrice', priceRange.max)

        const response = await fetch(`/api/search?${params.toString()}`)
        if (!response.ok) throw new Error('Search failed')

        const data = await response.json()
        const mapped: SearchResultProduct[] = (data.products || []).map((product: any) => ({
          id: product.id,
          name: product.name,
          nameEn: product.nameEn,
          brandName: product.brandName,
          categoryName: product.categoryName,
          productTypeName: product.productTypeName,
          sku: product.sku,
          basePrice: product.basePrice,
          priceRange: product.priceRange,
          variants: product.variants || [],
          primaryImage: product.primaryImage,
          usageCount: product.usageCount,
          viewCount: product.viewCount,
        }))

        setSearchResults((prev) => (append ? [...prev, ...mapped] : mapped))
        setHasMore(Boolean(data.hasMore))
        setOffset(nextOffset)
        setLastQuery(query)
        setTotalResults(data.total || mapped.length)
      } catch (error) {
        console.error(error)
        toast({
          title: 'Pencarian gagal',
          description: 'Periksa koneksi atau filter pencarianmu.',
          variant: 'destructive',
        })
        if (!append) {
          setSearchResults([])
          setHasMore(false)
          setTotalResults(0)
        }
      } finally {
        setLoadingSearch(false)
      }
    },
    [priceRange.max, priceRange.min, selectedBrand, selectedCategory, toast],
  )

  const updateSuggestions = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([])
      return
    }
    try {
      const response = await fetch(`/api/suggestions?q=${encodeURIComponent(query)}&limit=6`)
      if (!response.ok) throw new Error('Failed to load suggestions')
      const data = await response.json()
      setSuggestions(data.suggestions || [])
    } catch (error) {
      console.error(error)
      setSuggestions([])
    }
  }, [])

  useEffect(() => {
    const trimmed = searchQuery.trim()
    if (trimmed.length < 2) {
      setSearchResults([])
      setSuggestions([])
      setHasMore(false)
      setTotalResults(0)
      return
    }

    const timeout = setTimeout(() => {
      performSearch(trimmed, 0, false)
      updateSuggestions(trimmed)
    }, 300)

    return () => clearTimeout(timeout)
  }, [performSearch, searchQuery, updateSuggestions])

  const fetchCatalogMeta = async () => {
    try {
      const response = await fetch('/api/catalog/meta')
      if (!response.ok) throw new Error('Failed to load catalog metadata')
      const data = await response.json()
      setCategories(data.categories || [])
      setBrands(data.brands || [])
    } catch (error) {
      console.error(error)
    }
  }

  const fetchTrendingProducts = async () => {
    try {
      const response = await fetch('/api/catalog/trending?limit=6')
      if (!response.ok) throw new Error('Failed to load trending products')
      const data = await response.json()
      setTrendingProducts(
        (data.products || []).map((product: any) => ({
          id: product.id,
          name: product.name,
          brand: { name: product.brand.name },
          categoryName: product.categoryName ?? product.category?.name,
          primaryImage: product.primaryImage,
          priceRange: product.priceRange,
        })),
      )
    } catch (error) {
      console.error(error)
    }
  }

  const handleManualSearch = () => {
    const trimmed = searchQuery.trim()
    if (trimmed.length < 2) {
      toast({
        title: 'Masukkan kata kunci',
        description: 'Gunakan minimal 2 karakter untuk memulai pencarian.',
      })
      searchInputRef.current?.focus()
      return
    }
    performSearch(trimmed, 0, false)
    updateSuggestions(trimmed)
  }

  const handleLoadMore = () => {
    performSearch(lastQuery, offset + SEARCH_LIMIT, true)
  }

  const filteredBrands = useMemo(() => {
    if (!selectedCategory) return brands
    return brands.filter((brand) => brand.productsCount > 0)
  }, [brands, selectedCategory])

  const filteredResults = useMemo(() => {
    if (activeTab === 'all') return searchResults
    const matcher: Record<string, string[]> = {
      lighting: ['lighting', 'lampu', 'downlight', 'spotlight'],
      material: ['material', 'hpl', 'laminate', 'surface'],
      furniture: ['furniture', 'kursi', 'chair', 'sofa'],
      hardware: ['hardware', 'handle', 'engsel'],
    }
    const tokens = matcher[activeTab] || []
    return searchResults.filter((product) => {
      const category = (product.categoryName || '').toLowerCase()
      return tokens.some((token) => category.includes(token))
    })
  }, [activeTab, searchResults])

  const handleNavigate = useCallback(
    async (productId: string) => {
      try {
        await fetch('/api/activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: USER_ID,
            type: 'CLICK_PRODUCT',
            productId,
          }),
        })
      } catch (error) {
        console.error(error)
      } finally {
        router.push(`/product/${productId}`)
      }
    },
    [router],
  )

  const formatCurrency = (value?: number | null) => {
    if (value === null || value === undefined) return null
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value)
  }

  const formatPriceRange = (product: SearchResultProduct) => {
    const min = formatCurrency(product.priceRange?.min ?? product.basePrice)
    const max = formatCurrency(product.priceRange?.max ?? product.basePrice)
    if (min && max && min !== max) return `${min} - ${max}`
    return min ?? 'Harga belum tersedia'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="bg-white/70 backdrop-blur-md border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10 text-primary">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Architecture Catalog</p>
              <h1 className="text-xl font-semibold">Material / Lighting / Furniture</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push('/insights')}>
              <Eye className="w-4 h-4 mr-2" />
              Insights
            </Button>
            <Button size="sm" onClick={() => router.push('/schedule')}>
              <Package className="w-4 h-4 mr-2" />
              Project Schedules
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <section className="bg-white rounded-3xl p-6 shadow-sm border space-y-6">
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">Cari katalog</p>
            <div className="relative">
              <Input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value)
                  setShowSuggestions(true)
                }}
                placeholder='Contoh: "kursi", "HPL Taco", "downlight 3000K"'
                className="pl-10 py-6 text-lg"
                onFocus={() => suggestions.length && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    handleManualSearch()
                  }
                }}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-20 mt-2 w-full rounded-xl border bg-white shadow-lg overflow-hidden">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      className="w-full text-left px-4 py-2 hover:bg-muted text-sm"
                      onMouseDown={(event) => {
                        event.preventDefault()
                        setSearchQuery(suggestion)
                        setShowSuggestions(false)
                        handleManualSearch()
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant={showFilters ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowFilters((prev) => !prev)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <Button variant="outline" size="sm" onClick={handleManualSearch} disabled={loadingSearch}>
              {loadingSearch ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Searching…
                </>
              ) : (
                'Apply'
              )}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => router.push('/insights')}>
              <TrendingUp className="w-4 h-4 mr-2" />
              Insights
            </Button>
            <Button variant="ghost" size="sm" onClick={refreshSchedules} disabled={isScheduleLoading}>
              {isScheduleLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              Refresh Projects
            </Button>
          </div>

          {showFilters && (
            <Card>
              <CardHeader>
                <CardTitle>Filter detail</CardTitle>
                <CardDescription>Persempit hasil berdasarkan kategori, brand, atau rentang harga.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <Label>Kategori</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {categories.map((category) => (
                      <label key={category.id} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={selectedCategory === category.id}
                          onCheckedChange={(checked) => setSelectedCategory(checked ? category.id : '')}
                        />
                        <span>
                          {category.name}{' '}
                          <span className="text-xs text-muted-foreground">
                            ({category.productsCount})
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <Label>Brand</Label>
                  <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Semua brand" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Semua brand</SelectItem>
                      {filteredBrands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name} ({brand.productsCount})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label>Rentang harga (IDR)</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(event) => setPriceRange((prev) => ({ ...prev, min: event.target.value }))}
                    />
                    <Input
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(event) => setPriceRange((prev) => ({ ...prev, max: event.target.value }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-muted/50 border-dashed">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Project schedules</CardTitle>
                <CardDescription>
                  {isScheduleLoading
                    ? 'Memuat project…'
                    : schedules.length
                      ? `${schedules.length} project siap dipakai untuk menangkap item.`
                      : 'Belum ada project. Buat di halaman Project Schedule.'}
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => router.push('/schedule')}>
                Kelola Project
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardHeader>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Catalog Results</p>
              <h2 className="text-2xl font-bold">Search Results</h2>
              {totalResults > 0 && (
                <p className="text-sm text-muted-foreground">{totalResults} item ditemukan</p>
              )}
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="flex flex-wrap">
                <TabsTrigger value="all">Semua</TabsTrigger>
                <TabsTrigger value="lighting">Lighting</TabsTrigger>
                <TabsTrigger value="material">Material</TabsTrigger>
                <TabsTrigger value="furniture">Furniture</TabsTrigger>
                <TabsTrigger value="hardware">Hardware</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {loadingSearch && (
            <Card>
              <CardContent className="p-6 flex items-center gap-3 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Menelusuri katalog…
              </CardContent>
            </Card>
          )}

          {!loadingSearch && searchResults.length === 0 && (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                Ketik kata kunci minimal 2 karakter untuk melihat hasil pencarian.
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {filteredResults.map((product) => (
              <Card
                key={product.id}
                className="hover:shadow-md transition cursor-pointer"
                role="button"
                tabIndex={0}
                onClick={() => handleNavigate(product.id)}
              >
                <CardContent className="p-5 flex gap-4">
                  <div className="w-36 h-36 rounded-xl bg-muted overflow-hidden flex-shrink-0">
                    <img
                      src={product.primaryImage || '/api/placeholder/200/200'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">{product.brandName}</Badge>
                      {product.categoryName && <Badge variant="outline">{product.categoryName}</Badge>}
                      <Badge variant="outline">{product.productTypeName}</Badge>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{product.name}</h3>
                      {product.nameEn && <p className="text-sm text-muted-foreground">{product.nameEn}</p>}
                    </div>
                    <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                    <p className="text-base font-semibold">{formatPriceRange(product)}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{product.viewCount} views</span>
                      <span>{product.usageCount} schedule adds</span>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(event) => {
                          event.stopPropagation()
                          handleNavigate(product.id)
                        }}
                      >
                        Detail produk
                      </Button>
                      <AddToScheduleDialog
                        trigger={
                          <Button
                            size="sm"
                            onClick={(event) => event.stopPropagation()}
                          >
                            Tambahkan
                          </Button>
                        }
                        product={product}
                        userId={USER_ID}
                        schedules={schedules}
                        isScheduleLoading={isScheduleLoading}
                        onRefreshSchedules={refreshSchedules}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center">
              <Button variant="outline" onClick={handleLoadMore} disabled={loadingSearch}>
                {loadingSearch ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Muat lebih banyak
              </Button>
            </div>
          )}
        </section>

        <Separator />

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Personalized picks</p>
              <h2 className="text-2xl font-bold">Trending Products</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={fetchTrendingProducts}>
              Refresh
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trendingProducts.length ? (
              trendingProducts.map((product) => {
                const minPrice = formatCurrency(product.priceRange?.min)
                const maxPrice = formatCurrency(product.priceRange?.max)
                return (
                  <Card key={product.id} className="hover:shadow-md transition">
                    <CardContent className="p-4 space-y-3">
                      <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                        <img
                          src={product.primaryImage || '/api/placeholder/300/200'}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-1">
                        {product.categoryName && <Badge variant="outline">{product.categoryName}</Badge>}
                        <h3 className="font-semibold">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">{product.brand.name}</p>
                        {minPrice && (
                          <p className="text-sm font-medium">
                            {minPrice}
                            {maxPrice && maxPrice !== minPrice && <> - {maxPrice}</>}
                          </p>
                        )}
                      </div>
                      <Button className="w-full" variant="outline" onClick={() => handleNavigate(product.id)}>
                        Lihat produk
                      </Button>
                    </CardContent>
                  </Card>
                )
              })
            ) : (
              <Card className="md:col-span-2 lg:col-span-3">
                <CardContent className="p-8 text-center text-sm text-muted-foreground">
                  Belum ada data trending. Tambahkan aktivitas pencarian dan schedule untuk memicu rekomendasi.
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
