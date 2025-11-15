'use client'

import Link from 'next/link'
import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Calendar, Package, Search } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ProductCatalogTab } from '@/components/product/product-catalog-tab'
import { ProjectScheduleTab } from '@/components/projects/project-schedule-tab'

const USER_ID = 'anonymous'

function HomePageContent() {
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
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100 bg-white">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900">
                <Package className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-medium text-gray-900">Interior Studio</h1>
                <p className="text-sm text-gray-500">Search • Schedule • Database</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span>Online</span>
              </div>
              <Button asChild variant="outline" size="sm" className="rounded-md">
                <Link href="/admin">Admin</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as 'catalog' | 'schedule')}
          className="space-y-8"
        >
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-md grid-cols-2 p-1 bg-gray-50 rounded-lg">
              <TabsTrigger 
                value="catalog" 
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-colors"
              >
                <Search className="h-4 w-4" />
                <span>Catalog</span>
              </TabsTrigger>
              <TabsTrigger 
                value="schedule" 
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-colors"
              >
                <Calendar className="h-4 w-4" />
                <span>Schedule</span>
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="catalog" className="space-y-0">
            <ProductCatalogTab userId={USER_ID} />
          </TabsContent>
          <TabsContent value="schedule" className="space-y-0">
            <ProjectScheduleTab userId={USER_ID} initialScheduleId={initialScheduleId} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-slate-900"></div>
        <p className="mt-4 text-slate-600 dark:text-slate-400">Loading...</p>
      </div>
    </div>}>
      <HomePageContent />
    </Suspense>
  )
}
