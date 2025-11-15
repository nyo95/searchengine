"use client"

import { useMemo, useState } from 'react'
import { Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import type { ScheduleSummary } from '@/hooks/use-schedules'

type VariantSummary = {
  id: string
  name: string
  price: number | null
  attributes: Record<string, unknown>
}

type ProductSummary = {
  id: string
  name: string
  brandId: string
  brandName: string
  productTypeId: string
  sku: string
  basePrice?: number | null
  variants: VariantSummary[]
}

type AddToScheduleDialogProps = {
  trigger: React.ReactNode
  product: ProductSummary
  userId: string
  schedules: ScheduleSummary[]
  isScheduleLoading: boolean
  onRefreshSchedules: () => void
  onSuccess?: () => void
}

export function AddToScheduleDialog({
  trigger,
  product,
  userId,
  schedules,
  isScheduleLoading,
  onRefreshSchedules,
  onSuccess,
}: AddToScheduleDialogProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(product.variants[0]?.id)
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | undefined>(schedules[0]?.id)
  const [quantity, setQuantity] = useState(1)
  const [unitOfMeasure, setUnitOfMeasure] = useState('pcs')
  const [area, setArea] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedVariant = useMemo(() => product.variants.find((variant) => variant.id === selectedVariantId), [product.variants, selectedVariantId])
  const unitPrice = selectedVariant?.price ?? product.basePrice ?? 0

  const resetForm = () => {
    setQuantity(1)
    setUnitOfMeasure('pcs')
    setArea('')
    setNotes('')
    setSelectedVariantId(product.variants[0]?.id)
    setSelectedScheduleId(schedules[0]?.id)
  }

  const handleSubmit = async () => {
    if (!selectedScheduleId) {
      toast({
        title: 'Pilih proyek terlebih dahulu',
        description: 'Buat atau pilih project schedule sebelum menambahkan item.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/schedule/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduleId: selectedScheduleId,
          userId,
          productId: product.id,
          variantId: selectedVariant?.id,
          brandId: product.brandId,
          productTypeId: product.productTypeId,
          sku: product.sku,
          price: unitPrice,
          attributes: selectedVariant?.attributes ?? {},
          quantity,
          unitOfMeasure,
          area,
          notes,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error?.error || 'Failed to add item')
      }

      toast({
        title: 'Ditambahkan ke schedule',
        description: `${product.name} sudah masuk ke schedule terpilih.`,
      })
      resetForm()
      setOpen(false)
      onSuccess?.()
    } catch (error) {
      console.error(error)
      toast({
        title: 'Gagal menambahkan',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan, coba lagi.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => {
      setOpen(next)
      if (next && !selectedScheduleId && schedules[0]) {
        setSelectedScheduleId(schedules[0].id)
      }
    }}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Tambahkan ke Schedule</DialogTitle>
          <DialogDescription>
            Simpan snapshot produk beserta kuantitas dan catatan ke project schedule pilihanmu.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Project Schedule</Label>
            <div className="mt-2 flex gap-2">
              <Select
                value={selectedScheduleId}
                onValueChange={setSelectedScheduleId}
                disabled={isScheduleLoading || schedules.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isScheduleLoading ? 'Memuat...' : 'Pilih schedule'} />
                </SelectTrigger>
                <SelectContent>
                  {schedules.map((schedule) => (
                    <SelectItem key={schedule.id} value={schedule.id}>
                      {schedule.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={onRefreshSchedules} disabled={isScheduleLoading}>
                {isScheduleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                <span className="sr-only">Refresh schedules</span>
              </Button>
            </div>
            {!isScheduleLoading && schedules.length === 0 && (
              <p className="mt-2 text-sm text-muted-foreground">
                Belum ada project. Buat schedule baru di halaman Project Schedule, lalu klik refresh.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Variant</Label>
              <Select value={selectedVariantId} onValueChange={setSelectedVariantId} disabled={product.variants.length === 0}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Pilih variant" />
                </SelectTrigger>
                <SelectContent>
                  {product.variants.map((variant) => (
                    <SelectItem key={variant.id} value={variant.id}>
                      {variant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Kuantitas</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(event) => setQuantity(Math.max(1, Number(event.target.value)))}
                />
                <Input
                  value={unitOfMeasure}
                  onChange={(event) => setUnitOfMeasure(event.target.value)}
                  className="w-24"
                  placeholder="pcs"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Area / Zone</Label>
              <Input value={area} onChange={(event) => setArea(event.target.value)} placeholder="Contoh: Lobby" className="mt-2" />
            </div>
            <div>
              <Label>Catatan</Label>
              <Input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Keterangan tambahan" className="mt-2" />
            </div>
          </div>

          <div>
            <Label>Ringkasan Variant</Label>
            {selectedVariant ? (
              <div className="mt-2 rounded-lg border bg-muted/40 p-3 text-sm">
                <p className="font-medium">{selectedVariant.name}</p>
                <div className="mt-2 grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                  {Object.entries(selectedVariant.attributes || {}).map(([key, value]) => (
                    <span key={key}>
                      <strong className="text-foreground">{key}:</strong> {String(value)}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">Variant data tidak tersedia.</p>
            )}
          </div>
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button onClick={handleSubmit} disabled={isSubmitting || schedules.length === 0}>
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Tambahkan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
