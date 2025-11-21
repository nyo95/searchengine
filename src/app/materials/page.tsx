'use client'

import { Layers } from 'lucide-react'
import { ProductCatalogTab } from '@/components/product/product-catalog-tab'

const USER_ID = 'anonymous'

export default function MaterialsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-6">
        <header className="rounded-2xl border border-border/60 bg-card/70 p-5">
          <div className="flex items-center gap-3">
            <Layers className="h-5 w-5 text-secondary" />
            <div>
              <h1 className="text-2xl font-semibold">Material Catalog</h1>
              <p className="text-sm text-muted-foreground">
                Daftar semua material dengan kategori/subkategori yang terhubung. Gunakan tabel ini sebagai sumber resmi untuk scheduler dan impor.
              </p>
            </div>
          </div>
        </header>
        <ProductCatalogTab userId={USER_ID} />
      </div>
    </div>
  )
}
