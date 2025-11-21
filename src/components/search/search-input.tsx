"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface SearchInputProps {
  placeholder?: string
  onSearchSubmit?: (query: string) => void
  large?: boolean
}

export function SearchInput({
  placeholder = "Search products, brands, codes...",
  onSearchSubmit,
  large = false,
}: SearchInputProps) {
  const [query, setQuery] = useState("")
  const router = useRouter()

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (query.trim()) {
        if (onSearchSubmit) {
          onSearchSubmit(query)
        } else {
          router.push(`/search?q=${encodeURIComponent(query)}`)
        }
      }
    },
    [query, router, onSearchSubmit],
  )

  if (large) {
    return (
      <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="
              w-full px-6 py-4 text-lg rounded-lg
              bg-card border border-border
              focus:outline-none focus:ring-2 focus:ring-primary
              placeholder-muted-foreground
              shadow-sm
            "
          />
          <button
            type="submit"
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      </form>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-9"
        />
      </div>
    </form>
  )
}
