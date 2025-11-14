'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, Loader2, Package, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
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
  }, [performSearch, searchQuery, updateSuggestions, selectedCategory, selectedBrand])

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
    <div className="min-h-screen bg-muted/20">
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Kolom Filter */}
          <aside className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Filters</h2>
                <Card>
                  <CardHeader>
                    <CardTitle>Kategori</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    <div className="max-h-60 overflow-y-auto pr-2">
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(selectedCategory === category.id ? '' : category.id)}
                          className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                            selectedCategory === category.id
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-muted/50'
                          }`}
                        >
                          <span className="text-sm font-medium">{category.name}</span>{' '}
                          <span className={`text-xs ${
                            selectedCategory === category.id
                              ? 'text-primary-foreground/80'
                              : 'text-muted-foreground'
                          }`}>
                            ({category.productsCount})
                          </span>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Brand</CardTitle>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>
            </div>
          </aside>

          {/* Konten Utama */}
          <div className="lg:col-span-3 space-y-8">
            <section className="space-y-4 bg-background p-6 rounded-xl shadow-sm">
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
                    <Card className="absolute z-20 mt-2 w-full shadow-lg">
                      <CardContent className="p-2">
                        {suggestions.map((suggestion) => (
                          <button
                            key={suggestion}
                            className="w-full text-left px-3 py-2 rounded-md hover:bg-muted flex items-center gap-3"
                            onMouseDown={(event) => {
                              event.preventDefault()
                              setSearchQuery(suggestion)
                              setShowSuggestions(false)
                              handleManualSearch()
                            }}
                          >
                            <Search className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{suggestion}</span>
                          </button>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">Search Results</h2>
                  {totalResults > 0 && (
                    <p className="text-muted-foreground">{totalResults} item ditemukan</p>
                  )}
                </div>
              </div>

              {loadingSearch && searchResults.length === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="flex flex-col">
                      <CardHeader>
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <Skeleton className="w-full h-[200px] rounded-md" />
                        <div className="space-y-2 mt-4">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-2/3" />
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Skeleton className="h-10 w-full" />
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}

              {!loadingSearch && searchResults.length === 0 && (
                <Card>
                  <CardContent className="p-10 text-center">
                    <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">No results found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Ketik kata kunci minimal 2 karakter untuk melihat hasil pencarian.
                    </p>
                  </CardContent>
                </Card>
              )}

              <TooltipProvider>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {searchResults.map((product) => (
                    <Card
                      key={product.id}
                      className="overflow-hidden transition-shadow duration-300 hover:shadow-xl flex flex-col"
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg mb-2 leading-snug">
                              <a
                                href={`/product/${product.id}`}
                                className="hover:text-primary transition-colors"
                                onClick={(e) => {
                                  e.preventDefault()
                                  handleNavigate(product.id)
                                }}
                              >
                                {product.name}
                              </a>
                            </CardTitle>
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="secondary">{product.brandName}</Badge>
                              {product.categoryName && <Badge variant="outline">{product.categoryName}</Badge>}
                            </div>
                          </div>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-default">
                                <Eye className="w-4 h-4"/>
                                <span>{product.viewCount}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{product.viewCount} views</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <button
                          className="w-full block"
                          onClick={() => handleNavigate(product.id)}
                        >
                          <AspectRatio ratio={4 / 3}>
                            <img
                              src={product.primaryImage || '/api/placeholder/400/300'}
                              alt={product.name}
                              className="w-full h-full object-cover rounded-md hover:scale-105 transition-transform duration-300"
                            />
                          </AspectRatio>
                        </button>
                        <CardDescription className="mt-4 text-sm">
                          {product.nameEn ? product.nameEn : 'No description available.'}
                        </CardDescription>
                      </CardContent>
                      <CardFooter className="bg-muted/30 p-4 flex justify-end gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(event) => {
                              event.stopPropagation()
                              window.location.href = `/product/${product.id}`
                            }}
                          >
                            Edit
                        </Button>
                        <AddToScheduleDialog
                          trigger={
                            <Button
                              size="sm"
                              onClick={(event) => event.stopPropagation()}
                            >
                              Add to Schedule
                            </Button>
                          }
                          product={product}
                          userId={USER_ID}
                          schedules={schedules}
                          isScheduleLoading={isScheduleLoading}
                          onRefreshSchedules={refreshSchedules}
                        />
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TooltipProvider>

              {hasMore && (
                <div className="flex justify-center mt-6">
                  <Button variant="outline" onClick={handleLoadMore} disabled={loadingSearch}>
                    {loadingSearch ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Muat lebih banyak
                  </Button>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}


