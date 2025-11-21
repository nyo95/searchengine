"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import Sidebar from "@/components/sidebar"
import SearchHero from "@/components/search-hero"
import QuickStats from "@/components/quick-stats"
import CatalogSection from "@/components/catalog-section"
import ScheduleSection from "@/components/schedule-section"
import WorkflowPhases from "@/components/workflow-phases"

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isOpen={isSidebarOpen} />

      <main className="flex-1 overflow-auto">
        <header className="sticky top-0 z-40 border-b border-border bg-background/80">
          <div className="px-8 py-4 flex items-center justify-between">
            <h1 className="text-lg font-semibold text-foreground">Material Search Engine</h1>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="text-xs bg-transparent">
                Status: Online
              </Button>
            </div>
          </div>
        </header>

        <div className="space-y-12 p-8 max-w-7xl">
          {/* Search Hero Section */}
          <SearchHero onSearch={setSearchQuery} />

          {/* Quick Stats */}
          <QuickStats />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <CatalogSection searchQuery={searchQuery} />
            </div>
            <ScheduleSection />
          </div>

          {/* Workflow Phases */}
          <WorkflowPhases />
        </div>
      </main>
    </div>
  )
}
