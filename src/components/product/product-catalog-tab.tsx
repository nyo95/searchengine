'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Filter, Loader2, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useSchedules } from '@/hooks/use-schedules'
import { AddToScheduleDialog } from '@/components/schedule/add-to-schedule-dialog'
import { AddProductDialog } from '@/components/product/add-product-dialog'
import type { CatalogOption } from '@/components/product/add-product-dialog'

type CategoryOption = {
  id: string
  name: string
  nameEn?: string
  productsCount: number
}

type BrandOption = CategoryOption

type ProductTypeOption = {
  id: string
  name: string
  nameEn?: string | null
}

type VariantSummary = {
  id: string
  name: string
  price: number | null
  attributes: Record<string, unknown>
}

export type SearchResultProduct = {
  id: string
  name: string
  nameEn?: string | null
  brandId: string
  brandName: string
  categoryName?: string
  productTypeId: string
  productTypeName: string
  sku: string
  basePrice?: number | null
  priceRange?: { min: number | null; max: number | null }
  variants: VariantSummary[]
  primaryImage?: string
  usageCount: number
  viewCount: number
}

type ProductCatalogTabProps = {
  userId: string
}

const SEARCH_LIMIT = 12

export function ProductCatalogTab({ userId }: ProductCatalogTabProps) {
  const router = useRouter()
  const { toast } = useToast()
  const searchInputRef = useRef<HTMLInputElement>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResultProduct[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('ALL')
  const [selectedProductType, setSelectedProductType] = useState('ALL')
  const [showFilters, setShowFilters] = useState(false)
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [brands, setBrands] = useState<BrandOption[]>([])
  const [productTypes, setProductTypes] = useState<ProductTypeOption[]>([])
  const [loadingSearch, setLoadingSearch] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const [lastQuery, setLastQuery] = useState('')
  const [totalResults, setTotalResults] = useState(0)

  const { schedules, isLoading: isScheduleLoading, refresh: refreshSchedules } = useSchedules(userId)

  useEffect(() => {
    fetchCatalogOptions()
  }, [])

  const performSearch = useCallback(
    async (query: string, nextOffset = 0, append = false) => {
      if (!query.trim()) return
      setLoadingSearch(true)
      try {
        const params = new URLSearchParams({
          q: query,
          limit: String(SEARCH_LIMIT),
          offset: String(nextOffset),
        })
        if (selectedCategory) params.set('category', selectedCategory)
        if (selectedBrand && selectedBrand !== 'ALL') params.set('brand', selectedBrand)
        if (selectedProductType && selectedProductType !== 'ALL') {
          params.set('productTypeId', selectedProductType)
        }
        const response = await fetch(`/api/search?${params.toString()}`)
        if (!response.ok) throw new Error('Gagal memuat hasil pencarian')
        const data = await response.json()
        const mapped: SearchResultProduct[] = (data.products || []).map((product: any) => {
          const brandId = product.brand?.id ?? product.brandId ?? ''
          const productTypeId = product.productType?.id ?? product.productTypeId ?? ''
          return {
            id: product.id,
            name: product.name,
            nameEn: product.nameEn,
            brandId,
            brandName: product.brandName ?? product.brand?.name ?? '',
            categoryName: product.categoryName,
            productTypeId,
            productTypeName: product.productTypeName ?? product.productType?.name ?? '',
            sku: product.sku,
            basePrice: product.basePrice,
            priceRange: product.priceRange,
            variants: product.variants || [],
            primaryImage: product.primaryImage,
            usageCount: product.usageCount,
            viewCount: product.viewCount,
          }
        })
        setSearchResults((prev) => (append ? [...prev, ...mapped] : mapped))
        setLastQuery(query)
        setOffset(nextOffset)
        setHasMore(data.hasMore)
        setTotalResults(data.total)
        if (!mapped.length) {
          toast({
            title: 'Tidak ada hasil',
            description: 'Perbarui kata kunci atau filter pencarian Anda.',
          })
        }
      } catch (error) {
        console.error(error)
        toast({
          title: 'Pencarian gagal',
          description: 'Terjadi kesalahan saat memuat data katalog.',
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
    [selectedBrand, selectedCategory, selectedProductType, toast],
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

  const fetchCatalogOptions = async () => {
    try {
      const [metaRes, typeRes] = await Promise.all([fetch('/api/catalog/meta'), fetch('/api/catalog/product-types')])
      if (!metaRes.ok || !typeRes.ok) throw new Error('Failed to load catalog metadata')
      const meta = await metaRes.json()
      const typesData = await typeRes.json()
      setCategories(meta.categories || [])
      setBrands(meta.brands || [])
      setProductTypes((typesData.productTypes || []).map((pt: any) => ({ id: pt.id, name: pt.name, nameEn: pt.nameEn })))
    } catch (error) {
      console.error(error)
      toast({
        title: 'Gagal memuat metadata katalog',
        description: 'Silakan coba lagi dalam beberapa saat.',
        variant: 'destructive',
      })
    }
  }

  const filteredBrands = useMemo(() => brands, [brands])
  const brandCatalogOptions: CatalogOption[] = useMemo(
    () => filteredBrands.map((brand) => ({ id: brand.id, name: brand.name })),
    [filteredBrands],
  )
  const productTypeOptions: CatalogOption[] = useMemo(
    () => productTypes.map((type) => ({ id: type.id, name: type.name })),
    [productTypes],
  )
  const addProductDefaults = useMemo(
    () => ({
      brandId: selectedBrand !== 'ALL' ? selectedBrand : undefined,
      productTypeId: selectedProductType !== 'ALL' ? selectedProductType : undefined,
    }),
    [selectedBrand, selectedProductType],
  )

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

  const handleNavigate = useCallback(
    (id: string) => {
      router.push(`/product/${id}`)
    },
    [router],
  )

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value)
                setShowSuggestions(true)
              }}
              placeholder='Contoh: "kursi", "HPL Taco", "downlight 3000K"'
              className="pl-10 pr-4 py-6 text-base"
              onFocus={() => suggestions.length && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  handleManualSearch()
                }
              }}
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border bg-card shadow-lg">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-muted"
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
          <div className="flex flex-wrap items-center gap-2">
            <Button variant={showFilters ? 'default' : 'outline'} size="sm" onClick={() => setShowFilters((prev) => !prev)}>
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
            <Button variant="outline" size="sm" onClick={handleManualSearch} disabled={loadingSearch || searchQuery.trim().length < 2}>
              {loadingSearch ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching…
                </>
              ) : (
                'Apply'
              )}
            </Button>
            <AddProductDialog
              trigger={
                <Button size="sm" className="whitespace-nowrap">
                  Tambah Produk
                </Button>
              }
              brands={brandCatalogOptions}
              productTypes={productTypeOptions}
              defaultValues={addProductDefaults}
              description="Buat produk baru lalu lanjutkan ke halaman detail."
              onCreated={(product) => router.push(`/product/${product.id}`)}
            />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Gunakan kata kunci minimal 2 karakter untuk menelusuri katalog SKU interior & material kami.
        </p>

        {showFilters && (
          <Card>
            <CardHeader>
              <CardTitle>Filter detail</CardTitle>
              <CardDescription>Persempit hasil berdasarkan kategori, brand, atau tipe material.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="space-y-3">
                <Label>Kategori</Label>
                <div className="max-h-48 space-y-2 overflow-y-auto pr-2">
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={selectedCategory === category.id}
                        onCheckedChange={(checked) => setSelectedCategory(checked ? category.id : '')}
                      />
                      <span>
                        {category.name}{' '}
                        <span className="text-xs text-muted-foreground">({category.productsCount})</span>
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
              <div className="space-y-3">
                <Label>Product Type</Label>
                <Select value={selectedProductType} onValueChange={setSelectedProductType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Semua tipe material" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Semua tipe</SelectItem>
                    {productTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}
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
            <CardContent className="flex items-center gap-3 p-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
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

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {searchResults.map((product) => (
            <Card
              key={product.id}
              className="cursor-pointer transition hover:shadow-md"
              role="button"
              tabIndex={0}
              onClick={() => handleNavigate(product.id)}
            >
              <CardContent className="flex gap-4 p-5">
                <div className="h-36 w-36 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
                  <img
                    src={product.primaryImage || '/api/placeholder/200/200'}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 space-y-2">
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
                          onClick={(event) => {
                            event.stopPropagation()
                          }}
                        >
                          Tambahkan
                        </Button>
                      }
                      product={product}
                      userId={userId}
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
            <Button variant="secondary" onClick={handleLoadMore} disabled={loadingSearch}>
              {loadingSearch ? 'Loading…' : 'Load more'}
            </Button>
          </div>
        )}
      </section>
    </div>
  )
}
