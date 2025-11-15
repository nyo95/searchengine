'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Calendar, Package, Search } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ProductCatalogTab } from '@/components/product/product-catalog-tab'
import { ProjectScheduleTab } from '@/components/projects/project-schedule-tab'

const USER_ID = 'anonymous'

export default function HomePage() {
  const searchParams = useSearchParams()
  const initialTab = searchParams.get('tab') === 'schedule' ? 'schedule' : 'catalog'
  const [activeTab, setActiveTab] = useState<'catalog' | 'schedule'>(initialTab)
  const initialScheduleId = searchParams.get('scheduleId') || undefined

  useEffect(() => {
    if (searchParams.get('tab') === 'schedule') {
      setActiveTab('schedule')
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-foreground">Product & Schedule Management</h1>
                <p className="text-sm text-muted-foreground">
                  Kelola katalog SKU serta jadwal material proyek dalam satu workspace.
                </p>
              </div>
            </div>
            <Badge variant="outline" className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Sistem Online
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto space-y-6 px-4 py-6">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as 'catalog' | 'schedule')}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2 lg:w-[420px]">
            <TabsTrigger value="catalog" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Product Catalog
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Project Schedule
            </TabsTrigger>
          </TabsList>
          <TabsContent value="catalog">
            <ProductCatalogTab userId={USER_ID} />
          </TabsContent>
          <TabsContent value="schedule">
            <ProjectScheduleTab userId={USER_ID} initialScheduleId={initialScheduleId} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
