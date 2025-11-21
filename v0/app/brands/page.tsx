"use client"

import { useEffect, useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Plus, Trash2, Pencil } from "lucide-react"
import { BrandModal } from "@/components/modals/brand-modal"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Brand {
  id: string
  name: string
  website?: string
  phone?: string
  salesName?: string
  salesContact?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface BrandsResponse {
  brands: Brand[]
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null)

  useEffect(() => {
    fetchBrands()
  }, [])

  const fetchBrands = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/brands")
      const data: BrandsResponse = await response.json()
      setBrands(data.brands || [])
    } catch (err) {
      setError("Failed to fetch brands")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddBrand = () => {
    setSelectedBrand(null)
    setModalOpen(true)
  }

  const handleEditBrand = (brand: Brand) => {
    setSelectedBrand(brand)
    setModalOpen(true)
  }

  const handleDeleteBrand = async (brandId: string) => {
    if (!confirm("Delete this brand?")) return
    try {
      await fetch(`/api/brands/${brandId}`, { method: "PATCH", body: JSON.stringify({ isActive: false }) })
      setBrands((prev) => prev.filter((b) => b.id !== brandId))
    } catch (err) {
      console.error(err)
    }
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setSelectedBrand(null)
    fetchBrands()
  }

  return (
    <MainLayout>
      <div className="px-4 md:px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold">Brands</h2>
            <p className="text-sm text-muted-foreground mt-1">{brands.length} brands</p>
          </div>
          <Button onClick={handleAddBrand} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Brand
          </Button>
        </div>

        {error && (
          <div className="p-4 border border-destructive/30 bg-destructive/5 rounded-lg flex items-start gap-3 mb-6">
            <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="p-4 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
        ) : brands.length === 0 ? (
          <div className="border border-border rounded-lg p-12 text-center">
            <p className="text-muted-foreground mb-4">No brands found</p>
            <Button onClick={handleAddBrand} variant="outline" className="gap-2 bg-transparent">
              <Plus className="w-4 h-4" />
              Create First Brand
            </Button>
          </div>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Website</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Sales Contact</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {brands.map((brand) => (
                    <TableRow key={brand.id}>
                      <TableCell className="font-medium">{brand.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{brand.website || "-"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{brand.phone || "-"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{brand.salesName || "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleEditBrand(brand)}
                            className="p-1.5 hover:bg-muted rounded transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4 text-muted-foreground" />
                          </button>
                          <button
                            onClick={() => handleDeleteBrand(brand.id)}
                            className="p-1.5 hover:bg-destructive/10 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Brand Modal */}
        <BrandModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          brand={selectedBrand || undefined}
          onSuccess={handleModalClose}
        />
      </div>
    </MainLayout>
  )
}
