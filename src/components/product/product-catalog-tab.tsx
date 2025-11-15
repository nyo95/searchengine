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
  
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [brands, setBrands] = useState<BrandOption[]>([])
  const [productTypes, setProductTypes] = useState<ProductTypeOption[]>([])
  const [loadingSearch, setLoadingSearch] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const [lastQuery, setLastQuery] = useState('')
  const [totalResults, setTotalResults] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL')
  const [selectedProductType, setSelectedProductType] = useState<string>('ALL')
  const [showFilters, setShowFilters] = useState(false)

  

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
    () => ({}),
    [],
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
      <section className="space-y-6">
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-medium text-gray-900">Product Catalog</h2>
          <p className="text-gray-500">Search and browse interior materials</p>
        </div>
        
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              ref={searchInputRef}
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value)
                setShowSuggestions(true)
              }}
              placeholder='Search products...'
              className="pl-10 pr-4 py-3 text-base border border-gray-200 rounded-lg focus:border-gray-300 bg-white"
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
              <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                <div className="p-2">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 rounded-md transition-colors"
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
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button 
              variant={showFilters ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setShowFilters((prev) => !prev)}
              className="rounded-md"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
              {(selectedCategory || (selectedBrand !== 'ALL') || (selectedProductType !== 'ALL')) && (
                <span className="ml-2 h-2 w-2 rounded-full bg-gray-400"></span>
              )}
            </Button>
            <AddProductDialog
              trigger={
                <Button size="sm" className="rounded-md bg-gray-900 hover:bg-gray-800 text-white">
                  Add Product
                </Button>
              }
              brands={brandCatalogOptions}
              productTypes={productTypeOptions}
              defaultValues={addProductDefaults}
              description="Create new product"
              onCreated={(product) => router.push(`/product/${product.id}`)}
            />
          </div>
        </div>

        <div className="text-center text-sm text-gray-500">
          Type to search products
        </div>

        {showFilters && (
          <Card className="border-slate-200 dark:border-slate-700 shadow-lg">
            <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Advanced Filters
              </CardTitle>
              <CardDescription>
                Narrow down results by category, brand, or material type
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-6 lg:grid-cols-3 p-6">
              <div className="space-y-4">
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Category</Label>
                <div className="max-h-56 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center gap-3 text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-lg transition-colors">
                      <Checkbox
                        checked={selectedCategory === category.id}
                        onCheckedChange={(checked) => setSelectedCategory(checked ? category.id : '')}
                        className="rounded"
                      />
                      <span className="flex-1">
                        {category.name}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">
                        {category.productsCount}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Brand</Label>
                <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                  <SelectTrigger className="w-full h-11 rounded-lg">
                    <SelectValue placeholder="All brands" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All brands</SelectItem>
                    {filteredBrands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{brand.name}</span>
                          <span className="text-xs text-slate-500 ml-2">({brand.productsCount})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-4">
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Product Type</Label>
                <Select value={selectedProductType} onValueChange={setSelectedProductType}>
                  <SelectTrigger className="w-full h-11 rounded-lg">
                    <SelectValue placeholder="All material types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All types</SelectItem>
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

      <section className="space-y-6">
        {totalResults > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Search Results</h2>
              <p className="text-slate-600 dark:text-slate-400">
                Found <span className="font-semibold text-blue-600 dark:text-blue-400">{totalResults}</span> products
                {lastQuery && <span> for "{lastQuery}"</span>}
              </p>
            </div>
          </div>
        )}

        {loadingSearch && (
          <Card className="border-slate-200 dark:border-slate-700">
            <CardContent className="flex items-center justify-center gap-3 p-12">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <div className="text-center">
                <p className="text-slate-700 dark:text-slate-300 font-medium">Searching catalog...</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Finding the best products for you</p>
              </div>
            </CardContent>
          </Card>
        )}

        {!loadingSearch && searchResults.length === 0 && searchQuery.trim().length >= 2 && (
          <Card className="border-slate-200 dark:border-slate-700">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No products found</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                We couldn't find any products matching "{searchQuery}"
              </p>
              <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <p>Try:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Using different keywords</li>
                  <li>Checking spelling</li>
                  <li>Browsing with filters</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {!loadingSearch && searchResults.length === 0 && searchQuery.trim().length < 2 && (
          <Card className="border-slate-200 dark:border-slate-700">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Start searching</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Type at least 2 characters to explore our catalog of interior materials and products
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {searchResults.map((product) => (
            <Card
              key={product.id}
              className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-slate-200 dark:border-slate-700 overflow-hidden"
              role="button"
              tabIndex={0}
              onClick={() => handleNavigate(product.id)}
            >
              <CardContent className="p-0">
                <div className="flex">
                  <div className="relative h-48 w-48 flex-shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={product.primaryImage || '/api/placeholder/300/300'}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="flex-1 p-6 space-y-4">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                          {product.brandName}
                        </Badge>
                        {product.categoryName && (
                          <Badge variant="outline" className="border-slate-300 dark:border-slate-600">
                            {product.categoryName}
                          </Badge>
                        )}
                        <Badge variant="outline" className="border-slate-300 dark:border-slate-600">
                          {product.productTypeName}
                        </Badge>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {product.name}
                        </h3>
                        {product.nameEn && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 italic">{product.nameEn}</p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-mono text-slate-500 dark:text-slate-400">
                          SKU: {product.sku}
                        </p>
                        {product.basePrice && (
                          <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                            ${product.basePrice}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
                      <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                          {product.viewCount} views
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                          {product.usageCount} added
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(event) => {
                          event.stopPropagation()
                          handleNavigate(product.id)
                        }}
                        className="rounded-lg"
                      >
                        View Details
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(event) => {
                          event.stopPropagation()
                          window.location.href = `/product/${product.id}`
                        }}
                        className="rounded-lg"
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {hasMore && (
          <div className="flex justify-center pt-4">
            <Button 
              variant="outline" 
              onClick={handleLoadMore} 
              disabled={loadingSearch}
              className="rounded-lg px-8"
            >
              {loadingSearch ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading more products…
                </>
              ) : (
                'Load More Products'
              )}
            </Button>
          </div>
        )}
      </section>
    </div>
  )
}
