"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle } from "lucide-react"

interface Brand {
  id: string
  name: string
}

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
}

interface ProductModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product
  onSuccess?: () => void
}

const BRAND_PLACEHOLDER = "__select_brand__"

export function ProductModal({ open, onOpenChange, product, onSuccess }: ProductModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    brandId: BRAND_PLACEHOLDER,
    categoryName: "",
    subcategoryName: "",
    description: "",
    imageUrl: "",
    dynamicAttributes: {} as Record<string, string>,
    tags: "",
  })
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      fetchBrands()
      if (product) {
        setFormData({
          name: product.name,
          sku: product.sku,
          brandId: product.brand.id || BRAND_PLACEHOLDER,
          categoryName: product.category.name,
          subcategoryName: product.subcategory.name,
          description: product.description || "",
          imageUrl: product.imageUrl || "",
          dynamicAttributes: product.dynamicAttributes || {},
          tags: product.tags.join(", "),
        })
      } else {
        setFormData({
          name: "",
          sku: "",
          brandId: BRAND_PLACEHOLDER,
          categoryName: "",
          subcategoryName: "",
          description: "",
          imageUrl: "",
          dynamicAttributes: {},
          tags: "",
        })
      }
    }
  }, [open, product])

  const fetchBrands = async () => {
    try {
      const response = await fetch("/api/brands")
      const data = await response.json()
      setBrands(data.brands || [])
    } catch (err) {
      console.error(err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.name.trim() || !formData.sku.trim() || formData.brandId === BRAND_PLACEHOLDER) {
      setError("Please fill in all required fields")
      return
    }

    try {
      setLoading(true)
      const url = product ? `/api/products/${product.id}` : "/api/products"
      const method = product ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          sku: formData.sku,
          brandId: formData.brandId,
          categoryName: formData.categoryName,
          subcategoryName: formData.subcategoryName,
          description: formData.description || undefined,
          imageUrl: formData.imageUrl || undefined,
          dynamicAttributes: formData.dynamicAttributes,
          tags: formData.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      })

      if (!response.ok) throw new Error("Failed to save product")

      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save product")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "New Product"}</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="p-3 border border-destructive/30 bg-destructive/5 rounded flex items-start gap-2 text-sm text-destructive">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Product Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Homogeneous Tile"
              />
            </div>
            <div>
              <Label>SKU *</Label>
              <Input
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="e.g., HT-6060-WH-X"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Brand *</Label>
              <Select value={formData.brandId} onValueChange={(brandId) => setFormData({ ...formData, brandId })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={BRAND_PLACEHOLDER} disabled>
                    Select brand
                  </SelectItem>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Category</Label>
              <Input
                value={formData.categoryName}
                onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                placeholder="e.g., Material"
              />
            </div>
          </div>

          <div>
            <Label>Subcategory</Label>
            <Input
              value={formData.subcategoryName}
              onChange={(e) => setFormData({ ...formData, subcategoryName: e.target.value })}
              placeholder="e.g., Homogeneous Tile"
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Product description..."
              rows={3}
            />
          </div>

          <div>
            <Label>Image URL</Label>
            <Input
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div>
            <Label>Tags</Label>
            <Input
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="tag1, tag2, tag3"
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} type="button">
              Cancel
            </Button>
            <Button disabled={loading} type="submit">
              {loading && <span className="inline-block animate-spin">⟳</span>}
              {product ? "Update Product" : "Create Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
