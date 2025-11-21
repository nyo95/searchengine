"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { SearchInput } from "@/components/search/search-input"

export default function HomePage() {
  return (
    <MainLayout>
      <div className="min-h-full flex items-center justify-center px-4">
        <div className="w-full max-w-3xl">
          {/* Logo/Title */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-light tracking-tight mb-2">Catalog</h1>
            <p className="text-muted-foreground text-lg">Search materials, products, and manage your projects</p>
          </div>

          {/* Large Search Bar */}
          <SearchInput large />

          {/* Quick Stats / Info */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg border border-border bg-card/50 text-center">
              <p className="text-2xl font-semibold">0</p>
              <p className="text-xs text-muted-foreground mt-1">Products</p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-card/50 text-center">
              <p className="text-2xl font-semibold">0</p>
              <p className="text-xs text-muted-foreground mt-1">Brands</p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-card/50 text-center">
              <p className="text-2xl font-semibold">0</p>
              <p className="text-xs text-muted-foreground mt-1">Projects</p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-card/50 text-center">
              <p className="text-2xl font-semibold">0</p>
              <p className="text-xs text-muted-foreground mt-1">Schedules</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
