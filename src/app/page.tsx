"use client"

import { useMemo } from "react"
import Link from "next/link"
import { AppLayout } from "@/components/layout/app-layout"
import { SearchInput } from "@/components/search/search-input"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useSearchProducts, useCatalogMeta } from "@/hooks/useProducts"
import { useBrands } from "@/hooks/useBrands"
import { useProjects } from "@/hooks/useProjects"
import { useSchedules } from "@/hooks/use-schedules"

export default function HomePage() {
  // Load counts from existing APIs without altering backend
  const { data: productStats, isLoading: productsLoading } = useSearchProducts({
    q: "",
    page: 1,
    pageSize: 1,
    isActive: true,
  })
  const { data: brands, isLoading: brandsLoading } = useBrands()
  const { data: catalogMeta } = useCatalogMeta()
  const { data: projects, isLoading: projectsLoading } = useProjects()
  const { schedules, isLoading: schedulesLoading } = useSchedules("smoketest-user")

  const stats = useMemo(
    () => [
      { label: "Products", value: productStats?.total ?? 0, loading: productsLoading },
      { label: "Brands", value: brands?.length ?? 0, loading: brandsLoading },
      { label: "Projects", value: projects?.length ?? 0, loading: projectsLoading },
      { label: "Schedules", value: schedules?.length ?? 0, loading: schedulesLoading },
    ],
    [productStats?.total, productsLoading, brands?.length, brandsLoading, projects?.length, projectsLoading, schedules?.length, schedulesLoading],
  )

  return (
    <AppLayout>
      <div className="min-h-full flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-14">
            <h1 className="text-5xl font-light tracking-tight mb-3">Catalog</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Search materials, manage brands, and organize schedules in one minimalist workspace.
            </p>
          </div>

          <div className="mb-12">
            <SearchInput large />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <Card key={stat.label} className="bg-card/60 border-border">
                <CardContent className="p-4 text-center">
                  {stat.loading ? (
                    <Skeleton className="h-9 w-16 mx-auto mb-2" />
                  ) : (
                    <p className="text-3xl font-semibold">{stat.value}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            <Link href="/search" className="block">
              <Card className="h-full hover:border-foreground/30 transition-colors">
                <CardContent className="p-5 space-y-2">
                  <p className="text-sm font-semibold">Search</p>
                  <p className="text-sm text-muted-foreground">Find products by name, SKU, brand, or category.</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/catalog/products" className="block">
              <Card className="h-full hover:border-foreground/30 transition-colors">
                <CardContent className="p-5 space-y-2">
                  <p className="text-sm font-semibold">Products</p>
                  <p className="text-sm text-muted-foreground">View and manage the catalog with inline actions.</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/catalog/brands" className="block">
              <Card className="h-full hover:border-foreground/30 transition-colors">
                <CardContent className="p-5 space-y-2">
                  <p className="text-sm font-semibold">Brands</p>
                  <p className="text-sm text-muted-foreground">Maintain brand roster and contacts.</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
