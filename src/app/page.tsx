'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Eye, Filter, Loader2, Package, RefreshCw, Search } from 'lucide-react'
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
  const [selectedBrand, setSelectedBrand] = useState('ALL')
  const [showFilters, setShowFilters] = useState(false)
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [brands, setBrands] = useState<BrandOption[]>([])
  
  const [loadingSearch, setLoadingSearch] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const [lastQuery, setLastQuery] = useState('')
  const [totalResults, setTotalResults] = useState(0)

  const { schedules, isLoading: isScheduleLoading, refresh: refreshSchedules } = useSchedules(USER_ID)

  useEffect(() => {
    fetchCatalogMeta()
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
        if (selectedBrand && selectedBrand !== 'ALL') params.set('brand', selectedBrand)

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
    [selectedBrand, selectedCategory, toast],
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
  // Derived data for UI selections without altering visuals
  const filteredBrands = useMemo(() => {
    // Keep brand list as-is; future: filter by selectedCategory if mapping is available
    return brands
  }, [brands, selectedCategory])

  const handleManualSearch = useCallback(() => {
    const q = searchQuery.trim()
    if (!q) return
    performSearch(q, 0, false)
  }, [performSearch, searchQuery])

  const handleLoadMore = useCallback(() => {
    if (!lastQuery) return
    const nextOffset = offset + SEARCH_LIMIT
    performSearch(lastQuery, nextOffset, true)
  }, [lastQuery, offset, performSearch])

  const handleNavigate = useCallback((id: string) => {
    router.push(`/product/${id}`)
  }, [router])

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 space-y-8">
        <section className="space-y-4">
          <div className="space-y-3">
            <div className="relative">
              <Input
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
                      <SelectItem value="ALL">Semua brand</SelectItem>
                      {filteredBrands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name} ({brand.productsCount})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Harga bukan fokus utama; sembunyikan filter rentang harga */}
              </CardContent>
            </Card>
          )}

          {/* Projects summary card removed per requirement */}
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
            {searchResults.map((product) => (
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
                    {/* Harga bukan fokus utama; sembunyikan range harga */}
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(event) => {
                          event.stopPropagation()
                          window.location.href = `/product/${product.id}`
                        }}
                      >
                        Edit Product
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
            <div></div>
          </div>
        </section>
      </main>
    </div>
  )
}


