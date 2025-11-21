"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { SearchInput } from "@/components/search/search-input"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"

interface Product {
  id: string
  sku: string
  name: string
  internalCode: string
  description: string | null
  imageUrl: string | null
  brand: { id: string; name: string }
  category: { id: string; name: string }
  subcategory: { id: string; name: string; prefix: string }
  dynamicAttributes: Record<string, any> | null
  tags: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface SearchResponse {
  items: Product[]
  total: number
  page: number
  pageSize: number
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(!!query)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setLoading(false)
      return
    }

    const fetchResults = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`/api/search/products?q=${encodeURIComponent(query)}`)
        const data: SearchResponse = await response.json()
        setResults(data.items || [])
      } catch (err) {
        setError("Failed to fetch search results")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [query])

  return (
    <MainLayout>
      <div className="px-4 md:px-6 py-6">
        <div className="max-w-5xl">
          {/* Search Bar */}
          <div className="mb-8">
            <SearchInput />
          </div>

          {/* Results Header */}
          {query && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold">
                Search Results for <span className="text-muted-foreground">"{query}"</span>
              </h2>
              {!loading && (
                <p className="text-sm text-muted-foreground mt-1">
                  Found {results.length} result{results.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-4 border border-border rounded-lg">
                  <Skeleton className="h-5 w-1/3 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-3" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-4 border border-destructive/30 bg-destructive/5 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-destructive">{error}</p>
              </div>
            </div>
          )}

          {/* Results Grid */}
          {!loading && results.length > 0 && (
            <div className="grid gap-4">
              {results.map((product) => (
                <div
                  key={product.id}
                  className="p-4 border border-border rounded-lg hover:bg-card/50 transition-colors duration-150"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="flex-1">
                          <h3 className="font-medium text-foreground truncate">{product.name}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Code: {product.internalCode} • SKU: {product.sku}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
                        <span className="px-2 py-1 bg-muted rounded text-muted-foreground">{product.brand.name}</span>
                        <span className="px-2 py-1 bg-muted rounded text-muted-foreground">
                          {product.subcategory.name}
                        </span>
                        {product.dynamicAttributes && Object.keys(product.dynamicAttributes).length > 0 && (
                          <span className="px-2 py-1 bg-muted rounded text-muted-foreground">
                            {Object.entries(product.dynamicAttributes)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(", ")}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-shrink-0">
                      <button className="px-3 py-1.5 text-xs font-medium rounded bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                        View
                      </button>
                      <button className="px-3 py-1.5 text-xs font-medium rounded border border-border hover:bg-muted transition-colors">
                        Add to Project
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && query && results.length === 0 && !error && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No products found matching your search.</p>
              <p className="text-sm text-muted-foreground mt-1">Try different keywords or browse all products.</p>
            </div>
          )}

          {/* Initial State */}
          {!query && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Enter a search term to find products and materials.</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
