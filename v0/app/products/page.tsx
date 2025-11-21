"use client"

import { useEffect, useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Plus, Trash2, Pencil } from "lucide-react"
import { ProductModal } from "@/components/modals/product-modal"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Product {
  id: string
  sku: string
  name: string
  internalCode: string
  description: string | null
  imageUrl: string | null
  brand: { id: string; name: string }
  category: { id: string; name: string }
  subcategory: { id: string; name: string; prefix: string }
  dynamicAttributes: Record<string, any> | null
  tags: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface ProductsResponse {
  items: Product[]
  total: number
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/products?isActive=true&pageSize=100")
      const data: ProductsResponse = await response.json()
      setProducts(data.items || [])
    } catch (err) {
      setError("Failed to fetch products")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddProduct = () => {
    setSelectedProduct(null)
    setModalOpen(true)
  }

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product)
    setModalOpen(true)
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Delete this product?")) return
    try {
      await fetch(`/api/products/${productId}`, { method: "PATCH", body: JSON.stringify({ isActive: false }) })
      setProducts((prev) => prev.filter((p) => p.id !== productId))
    } catch (err) {
      console.error(err)
    }
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setSelectedProduct(null)
    fetchProducts()
  }

  return (
    <MainLayout>
      <div className="px-4 md:px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold">Products</h2>
            <p className="text-sm text-muted-foreground mt-1">{products.length} products in catalog</p>
          </div>
          <Button onClick={handleAddProduct} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Product
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
        ) : products.length === 0 ? (
          <div className="border border-border rounded-lg p-12 text-center">
            <p className="text-muted-foreground mb-4">No products found</p>
            <Button onClick={handleAddProduct} variant="outline" className="gap-2 bg-transparent">
              <Plus className="w-4 h-4" />
              Create First Product
            </Button>
          </div>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{product.name}</p>
                          {product.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{product.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">{product.internalCode}</code>
                      </TableCell>
                      <TableCell className="text-sm">{product.sku}</TableCell>
                      <TableCell className="text-sm">{product.brand.name}</TableCell>
                      <TableCell className="text-sm">{product.subcategory.name}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="p-1.5 hover:bg-muted rounded transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4 text-muted-foreground" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
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

        {/* Product Modal */}
        <ProductModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          product={selectedProduct || undefined}
          onSuccess={handleModalClose}
        />
      </div>
    </MainLayout>
  )
}
