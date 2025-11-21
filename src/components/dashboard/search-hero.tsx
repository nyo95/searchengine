'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type DashboardSearchHeroProps = {
  onSearch?: (query: string) => void
}

const trendingQueries = ['Interior Material', 'Metal Parts', 'Electrical', 'Wood']

export function DashboardSearchHero({ onSearch }: DashboardSearchHeroProps) {
  const [query, setQuery] = useState('')

  const triggerSearch = (nextQuery: string) => {
    const trimmed = nextQuery.trim()
    setQuery(nextQuery)
    if (trimmed.length >= 2 && onSearch) {
      onSearch(trimmed)
    }
  }

  const handleSubmit = () => {
    triggerSearch(query)
  }

  return (
    <section className="space-y-8 rounded-2xl border border-border/70 bg-card/70 p-6 shadow-lg shadow-slate-900/30">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Dashboard</p>
        <h1 className="text-3xl font-semibold leading-tight text-foreground md:text-4xl">Material Search Engine</h1>
        <p className="text-sm text-muted-foreground">
          Cari materials berdasarkan SKU, nama, brand, atau kategori.
        </p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && handleSubmit()}
            placeholder="Search materials, SKU, or brand..."
            className="h-12 bg-background/60 pl-12 text-base"
          />
        </div>
        <Button
          onClick={handleSubmit}
          disabled={query.trim().length < 2}
          size="lg"
          className="h-12 px-6"
        >
          Search
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <span className="text-xs text-muted-foreground">Popular searches:</span>
        {trendingQueries.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => triggerSearch(item)}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground hover:underline"
          >
            {item}
          </button>
        ))}
      </div>
    </section>
  )
}
