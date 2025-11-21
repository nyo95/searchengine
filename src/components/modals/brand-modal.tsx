"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"

interface Brand {
  id: string
  name: string
  website?: string
  phone?: string
  salesName?: string
  salesContact?: string
  isActive: boolean
}

interface BrandModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  brand?: Brand
  onSuccess?: () => void
}

export function BrandModal({ open, onOpenChange, brand, onSuccess }: BrandModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    website: "",
    phone: "",
    salesName: "",
    salesContact: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      if (brand) {
        setFormData({
          name: brand.name,
          website: brand.website || "",
          phone: brand.phone || "",
          salesName: brand.salesName || "",
          salesContact: brand.salesContact || "",
        })
      } else {
        setFormData({ name: "", website: "", phone: "", salesName: "", salesContact: "" })
      }
    }
  }, [open, brand])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.name.trim()) {
      setError("Brand name is required")
      return
    }

    try {
      setLoading(true)
      const url = brand ? `/api/brands/${brand.id}` : "/api/brands"
      const method = brand ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          website: formData.website || undefined,
          phone: formData.phone || undefined,
          salesName: formData.salesName || undefined,
          salesContact: formData.salesContact || undefined,
        }),
      })

      if (!response.ok) throw new Error("Failed to save brand")

      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save brand")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{brand ? "Edit Brand" : "New Brand"}</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="p-3 border border-destructive/30 bg-destructive/5 rounded flex items-start gap-2 text-sm text-destructive">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Brand Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Test Brand X"
            />
          </div>

          <div>
            <Label>Website</Label>
            <Input
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://..."
              type="url"
            />
          </div>

          <div>
            <Label>Phone</Label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <div>
            <Label>Sales Contact Name</Label>
            <Input
              value={formData.salesName}
              onChange={(e) => setFormData({ ...formData, salesName: e.target.value })}
              placeholder="John Doe"
            />
          </div>

          <div>
            <Label>Sales Contact</Label>
            <Input
              value={formData.salesContact}
              onChange={(e) => setFormData({ ...formData, salesContact: e.target.value })}
              placeholder="contact@example.com"
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} type="button">
              Cancel
            </Button>
            <Button disabled={loading} type="submit">
              {loading && <span className="inline-block animate-spin">⟳</span>}
              {brand ? "Update Brand" : "Create Brand"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
