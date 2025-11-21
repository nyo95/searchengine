"use client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { useState } from "react"

interface SearchHeroProps {
  onSearch: (query: string) => void
}

export default function SearchHero({ onSearch }: SearchHeroProps) {
  const [query, setQuery] = useState("")

  const handleSearch = () => {
    if (query.trim().length >= 2) {
      onSearch(query)
    }
  }

  return (
    <div className="space-y-8 py-6">
      <div>
        <h2 className="text-4xl md:text-5xl font-semibold text-foreground mb-2">Product Search</h2>
        <p className="text-base text-muted-foreground">Search materials by SKU, name, brand, or category</p>
      </div>

      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search materials, SKU, or brand..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-12 h-11 text-base bg-card border-border focus:border-foreground transition-colors"
          />
        </div>
        <Button
          onClick={handleSearch}
          disabled={query.trim().length < 2}
          size="lg"
          className="px-8 bg-foreground text-background hover:bg-muted-foreground"
        >
          Search
        </Button>
      </div>

      <div className="flex flex-wrap gap-4 pt-2">
        <span className="text-xs text-muted-foreground">Popular searches:</span>
        {["Interior Material", "Metal Parts", "Electrical", "Wood"].map((tag) => (
          <button
            key={tag}
            onClick={() => {
              setQuery(tag)
              onSearch(tag)
            }}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors border-b border-transparent hover:border-foreground/30"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  )
}
