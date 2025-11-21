"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { AppLayout } from "@/components/layout/app-layout"
import { SearchInput } from "@/components/search/search-input"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useSearchProducts } from "@/hooks/useProducts"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get("q") || ""

  const [triggeredQuery, setTriggeredQuery] = useState(query)

  useEffect(() => {
    setTriggeredQuery(query)
  }, [query])

  const { data: result, isLoading, error } = useSearchProducts({
    q: triggeredQuery,
    isActive: true,
    page: 1,
    pageSize: 50,
  })

  const products = result?.items || []

  return (
    <AppLayout>
      <div className="px-4 md:px-6 py-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-semibold">Search</h2>
            <p className="text-sm text-muted-foreground">Find products across the catalog</p>
          </div>
        </div>

        <div className="mb-8">
          <SearchInput
            placeholder="Search products, brands, codes..."
            onSearchSubmit={(nextQuery) => router.push(`/search?q=${encodeURIComponent(nextQuery)}`)}
          />
        </div>

        {query && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold">
              Results for <span className="text-muted-foreground">"{query}"</span>
            </h3>
            {!isLoading && (
              <p className="text-sm text-muted-foreground mt-1">
                Found {result?.total ?? 0} result{(result?.total ?? 0) !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="p-4 border border-destructive/30 bg-destructive/5 rounded-lg flex items-start gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-destructive">Failed to fetch search results</p>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
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

        {!isLoading && products.length > 0 && (
          <div className="grid gap-4">
            {products.map((product) => (
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
                      <Badge variant="secondary">{product.brand.name}</Badge>
                      {product.subcategory?.name && (
                        <Badge variant="secondary">{product.subcategory.name}</Badge>
                      )}
                      {product.dynamicAttributes && Object.keys(product.dynamicAttributes).length > 0 && (
                        <Badge variant="outline">
                          {Object.entries(product.dynamicAttributes)
                            .map(([k, v]) => `${k}: ${String(v)}`)
                            .join(", ")}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                    <Button size="sm">Add to Project</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && query && products.length === 0 && !error && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No products found matching your search.</p>
            <p className="text-sm text-muted-foreground mt-1">Try different keywords or browse all products.</p>
          </div>
        )}

        {!query && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Enter a search term to start.</p>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
