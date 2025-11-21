"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Filter, Plus, AlertCircle, Zap } from "lucide-react"
import { useState } from "react"

interface CatalogSectionProps {
  searchQuery: string
}

export default function CatalogSection({ searchQuery }: CatalogSectionProps) {
  const [hasSearched, setHasSearched] = useState(false)

  // Mock search results
  const mockResults =
    searchQuery.trim().length >= 2
      ? [
          { sku: "MAT-001", name: "Aluminum Frame 2x4", brand: "Luxe Materials", category: "Metal Parts" },
          { sku: "MAT-002", name: "Steel Reinforcement Bar", brand: "BuildCore", category: "Metal Parts" },
          { sku: "MAT-003", name: "Oak Wood Panel", brand: "Natural Woods", category: "Wood" },
        ]
      : []

  return (
    <Card className="p-6 md:p-8">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Zap className="w-5 h-5 text-accent" />
            Catalog Results
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {searchQuery.trim().length >= 2
              ? `Found ${mockResults.length} results for "${searchQuery}"`
              : "Enter a search query to discover materials"}
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Filter results..."
              className="w-full px-4 py-2 text-sm bg-input border border-border rounded-lg placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button variant="default" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>

        {/* Results or Empty State */}
        <div className="space-y-3">
          {searchQuery.trim().length >= 2 ? (
            <>
              {mockResults.map((result, i) => (
                <div
                  key={i}
                  className="p-4 border border-border rounded-lg hover:bg-card/50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-foreground group-hover:text-accent transition-colors">
                        {result.name}
                      </p>
                      <div className="flex gap-4 mt-2">
                        <span className="text-xs text-muted-foreground">
                          <span className="font-semibold">SKU:</span> {result.sku}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          <span className="font-semibold">Brand:</span> {result.brand}
                        </span>
                        <span className="text-xs px-2 py-1 rounded bg-accent/10 text-accent">{result.category}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      Select
                    </Button>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="p-8 text-center border border-dashed border-border rounded-lg">
              <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="font-medium text-foreground">Start Searching</p>
              <p className="text-sm text-muted-foreground mt-1">
                Enter at least 2 characters to search materials by SKU, name, brand, or category
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
