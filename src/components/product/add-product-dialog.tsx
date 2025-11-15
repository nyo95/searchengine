'use client'

import { useEffect, useMemo, useState } from 'react'
import { Loader2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

export type CatalogOption = {
  id: string
  name: string
}

export type CatalogProductOption = {
  id: string
  name: string
  sku: string
  brandId: string
  brandName?: string
  productTypeId: string
  productTypeName?: string
}

type AddProductDialogProps = {
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  brands: CatalogOption[]
  productTypes: CatalogOption[]
  defaultValues?: {
    brandId?: string
    productTypeId?: string
  }
  onCreated?: (product: CatalogProductOption) => void
  title?: string
  description?: string
}

export function AddProductDialog({
  trigger,
  open,
  onOpenChange,
  brands,
  productTypes,
  defaultValues,
  onCreated,
  title = 'Add Product',
  description = 'Create a new product entry in the catalog',
}: AddProductDialogProps) {
  const isControlled = typeof open === 'boolean'
  const [internalOpen, setInternalOpen] = useState(false)
  const dialogOpen = isControlled ? (open as boolean) : internalOpen

  const { toast } = useToast()
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [brandId, setBrandId] = useState(defaultValues?.brandId ?? '')
  const [productTypeId, setProductTypeId] = useState(defaultValues?.productTypeId ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canSubmit = useMemo(() => {
    return Boolean(name.trim() && sku.trim() && brandId && productTypeId)
  }, [name, sku, brandId, productTypeId])

  const resetForm = () => {
    setName('')
    setSku('')
    setBrandId(defaultValues?.brandId ?? '')
    setProductTypeId(defaultValues?.productTypeId ?? '')
  }

  useEffect(() => {
    if (dialogOpen) {
      setBrandId(defaultValues?.brandId ?? '')
      setProductTypeId(defaultValues?.productTypeId ?? '')
    }
  }, [dialogOpen, defaultValues?.brandId, defaultValues?.productTypeId])

  const handleOpenChange = (next: boolean) => {
    if (!isControlled) {
      setInternalOpen(next)
    }
    onOpenChange?.(next)
    if (!next) {
      resetForm()
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit) return
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          sku: sku.trim(),
          brandId,
          productTypeId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to create product')
      }

      const data = await response.json()
      const product = data.product as { id: string; name: string; sku: string; brandId: string; productTypeId: string }
      if (!product?.id) throw new Error('Product not returned by API')

      const created: CatalogProductOption = {
        id: product.id,
        name: name.trim(),
        sku: sku.trim(),
        brandId,
        brandName: brands.find((b) => b.id === brandId)?.name,
        productTypeId,
        productTypeName: productTypes.find((pt) => pt.id === productTypeId)?.name,
      }

      toast({ title: 'Product created', description: `${created.name} berhasil ditambahkan.` })
      onCreated?.(created)
      handleOpenChange(false)
    } catch (error: any) {
      toast({
        title: 'Gagal membuat produk',
        description: error?.message || 'Terjadi kesalahan saat membuat produk baru.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="new-product-name">Product Name</Label>
            <Input
              id="new-product-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nama produk"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-product-sku">SKU</Label>
            <Input
              id="new-product-sku"
              value={sku}
              onChange={(event) => setSku(event.target.value)}
              placeholder="SKU unik"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Brand</Label>
            <Select value={brandId || 'NONE'} onValueChange={(value) => setBrandId(value === 'NONE' ? '' : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">Pilih brand</SelectItem>
                {brands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Product Type</Label>
            <Select
              value={productTypeId || 'NONE'}
              onValueChange={(value) => setProductTypeId(value === 'NONE' ? '' : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih tipe produk" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">Pilih tipe produk</SelectItem>
                {productTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Simpan'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
