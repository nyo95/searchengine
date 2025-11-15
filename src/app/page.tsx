'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Search, Package, Calendar } from 'lucide-react';
import { ProductCatalog } from '@/components/product-catalog';
import { ProjectSchedule } from '@/components/project-schedule';

export default function Home() {
  const [activeTab, setActiveTab] = useState('catalog');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Product & Schedule Management</h1>
                <p className="text-sm text-muted-foreground">Manage your product catalog and project schedules</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="hidden sm:flex">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                System Online
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-400">
            <TabsTrigger value="catalog" className="flex items-center space-x-2">
              <Search className="w-4 h-4" />
              <span>Product Catalog</span>
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Project Schedule</span>
            </TabsTrigger>
          </TabsList>

          {/* Product Catalog Tab */}
          <TabsContent value="catalog">
            <ProductCatalog />
          </TabsContent>

          {/* Project Schedule Tab */}
          <TabsContent value="schedule">
            <ProjectSchedule />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}