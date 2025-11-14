'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  Activity,
  ArrowLeft,
  Download,
  Eye,
  Heart,
  Loader2,
  Package,
  Plus,
  RefreshCw,
  Search,
  Share2,
} from 'lucide-react'
import { SerializableProduct } from '@/lib/serializers/product'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { useSchedules } from '@/hooks/use-schedules'

type RelatedProduct = {
  id: string
  name: string
  brandName: string
  price: number | null
  image: string
}

type ProductDetailClientProps = {
  product: SerializableProduct
  relatedProducts: RelatedProduct[]
  userId?: string
}

const DEFAULT_USER_ID = 'anonymous'

export function ProductDetailClient({
  product,
  relatedProducts,
  userId = DEFAULT_USER_ID,
}: ProductDetailClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { schedules, isLoading: schedulesLoading, refresh: refreshSchedules } = useSchedules(userId)
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>('')
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0]?.id ?? null)
  const selectedVariant = useMemo(
    () => product.variants.find((variant) => variant.id === selectedVariantId) ?? product.variants[0],
    [product.variants, selectedVariantId],
  )
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [scheduleData, setScheduleData] = useState({ area: '', notes: '' })
  const galleryImages = product.images.length
    ? product.images
    : [{ id: 'placeholder', url: '/api/placeholder/400/400', label: 'Placeholder', metadata: null, variantId: null }]

  const [images, setImages] = useState(galleryImages)
  const [attrRows, setAttrRows] = useState<{ key: string; value: string }[]>(() => {
    const src = (product.variants[0]?.attributes as Record<string, unknown>) || {}
    return Object.entries(src).map(([k, v]) => ({ key: k, value: String(v ?? '') }))
  })
  const [uploading, setUploading] = useState(false)
  const [cropOpen, setCropOpen] = useState(false)
  const [cropFile, setCropFile] = useState<File | null>(null)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (!selectedScheduleId && schedules.length) {
      setSelectedScheduleId(schedules[0].id)
    }
  }, [schedules, selectedScheduleId])

  const trackActivity = useCallback(
    async (type: string, productId?: string, variantId?: string) => {
      try {
        await fetch('/api/activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            type,
            productId,
            variantId,
            brandId: product.brand.id,
          }),
        })
      } catch (error) {
        console.error('Error tracking activity:', error)
      }
    },
    [product.brand.id, userId],
  )

  // View tracking removed per lean scope (only ADD_TO_SCHEDULE is tracked)

  const handleAddToSchedule = async () => {
    if (!selectedScheduleId) {
      toast({
        title: 'Pilih project schedule',
        description: 'Buat atau pilih schedule sebelum menambahkan item.',
        variant: 'destructive',
      })
      return
    }

    try {
      const response = await fetch('/api/schedule/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduleId: selectedScheduleId,
          userId,
          productId: product.id,
          variantId: selectedVariant?.id,
          productName: product.name,
          brandName: product.brand.name,
          sku: product.sku,
          price: selectedVariant?.price ?? product.basePrice ?? 0,
          attributes: selectedVariant?.attributes ?? {},
          quantity,
          unitOfMeasure: 'pcs',
          area: scheduleData.area,
          notes: scheduleData.notes,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error?.error || 'Gagal menambahkan item ke schedule.')
      }

      toast({
        title: 'Ditambahkan ke schedule',
        description: `${product.name} berhasil disimpan.`,
      })
      trackActivity('ADD_TO_SCHEDULE', product.id, selectedVariant?.id)
    } catch (error) {
      console.error('Error adding to schedule:', error)
      toast({
        title: 'Gagal menambahkan',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan. Coba lagi.',
        variant: 'destructive',
      })
    }
  }

  const formatPrice = (price: number | null | undefined) => {
    if (price === null || price === undefined) return 'N/A'
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-muted-foreground" />
                <span className="font-semibold">Product Details</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Heart className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={galleryImages[selectedImageIndex].url}
                alt={product.name}
                width={600}
                height={600}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-5 gap-3">
              {galleryImages.map((image, index) => (
                <button
                  key={image.id ?? index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`aspect-square rounded-lg overflow-hidden border ${
                    selectedImageIndex === index ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <Image
                    src={image.url}
                    alt={`${product.name} ${index + 1}`}
                    width={120}
                    height={120}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <Badge variant="secondary">{product.brand.name}</Badge>
              {product.category?.name && <Badge variant="outline" className="ml-2">{product.category.name}</Badge>}
              <h1 className="text-3xl font-bold mt-4">{product.name}</h1>
              {product.nameEn && <p className="text-muted-foreground">{product.nameEn}</p>}
              <p className="text-sm text-muted-foreground mt-2">SKU: {product.sku}</p>
              {product.description && <p className="mt-4 text-muted-foreground">{product.description}</p>}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Configuration</CardTitle>
                <CardDescription>Select variant and schedule details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {product.variants.length > 0 && (
                  <div>
                    <Label>Variants</Label>
                    <Select value={selectedVariant?.id ?? ''} onValueChange={setSelectedVariantId}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select variant" />
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
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(event) => setQuantity(parseInt(event.target.value, 10) || 1)}
                      className="mt-2"
                    />
                  </div>
                <div>
                  <Label>Area / Zone</Label>
                  <Input
                    value={scheduleData.area}
                    onChange={(event) => setScheduleData((prev) => ({ ...prev, area: event.target.value }))}
                    className="mt-2"
                    placeholder="e.g. Main Office"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Project Schedule</Label>
                <div className="flex gap-2">
                  <Select
                    value={selectedScheduleId}
                    onValueChange={setSelectedScheduleId}
                    disabled={schedulesLoading || schedules.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={schedulesLoading ? 'Loading…' : 'Select schedule'} />
                    </SelectTrigger>
                    <SelectContent>
                      {schedules.map((schedule) => (
                        <SelectItem key={schedule.id} value={schedule.id}>
                          {schedule.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon" onClick={refreshSchedules} disabled={schedulesLoading}>
                    {schedulesLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    <span className="sr-only">Refresh schedules</span>
                  </Button>
                </div>
                {!schedulesLoading && schedules.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Belum ada project. Buat dari halaman Project Schedule lalu klik refresh.
                  </p>
                )}
              </div>

              <div>
                <Label>Notes</Label>
                <Input
                  value={scheduleData.notes}
                  onChange={(event) => setScheduleData((prev) => ({ ...prev, notes: event.target.value }))}
                    className="mt-2"
                    placeholder="Installation or procurement notes"
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={handleAddToSchedule}
                  disabled={schedulesLoading || schedules.length === 0}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Schedule
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Overview</CardTitle>
                <CardDescription>Usage and visibility metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Usage Count</span>
                  <span>{product.usageCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Views</span>
                  <span>{product.viewCount}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="specs" className="space-y-6">
          <TabsList>
            <TabsTrigger value="specs">Specifications</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="edit">Edit Product</TabsTrigger>
          </TabsList>

          <TabsContent value="specs">
            <Card>
              <CardHeader>
                <CardTitle>Variant Specifications</CardTitle>
                <CardDescription>Attributes for the selected configuration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedVariant &&
                    Object.entries(selectedVariant.attributes || {}).map(([key, value]) => (
                      <div key={key} className="space-y-1 rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground uppercase tracking-wide">{key}</p>
                        <p className="font-medium">{String(value)}</p>
                      </div>
                    ))}
                  {!selectedVariant && (
                    <p className="text-sm text-muted-foreground">No variant attributes available.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="edit">
            <Card>
              <CardHeader>
                <CardTitle>Edit Attributes</CardTitle>
                <CardDescription>Tambahkan baris Attribute | Value</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {attrRows.map((row, idx) => (
                  <div key={idx} className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Attribute"
                      value={row.key}
                      onChange={(e) => {
                        const next = [...attrRows]
                        next[idx] = { ...row, key: e.target.value }
                        setAttrRows(next)
                      }}
                    />
                    <Input
                      placeholder="Value"
                      value={row.value}
                      onChange={(e) => {
                        const next = [...attrRows]
                        next[idx] = { ...row, value: e.target.value }
                        setAttrRows(next)
                      }}
                    />
                  </div>
                ))}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setAttrRows((r) => [...r, { key: '', value: '' }])}>Tambah baris</Button>
                  <Button size="sm" onClick={async () => {
                    try {
                      const attrs = Object.fromEntries(attrRows.filter(r => r.key.trim()).map(r => [r.key.trim(), r.value]))
                      const variantId = product.variants[0]?.id
                      if (!variantId) return
                      const res = await fetch(`/api/products/${product.id}/variants`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ variantId, attributes: attrs }),
                      })
                      if (!res.ok) throw new Error('Gagal menyimpan atribut')
                      toast({ title: 'Tersimpan', description: 'Atribut berhasil diperbarui.' })
                    } catch (e) {
                      console.error(e)
                      toast({ title: 'Gagal', description: 'Tidak dapat menyimpan atribut', variant: 'destructive' })
                    }
                  }}>Simpan</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Upload Foto</CardTitle>
                <CardDescription>Maksimal 2 foto non-crop + 1 thumbnail 1:1</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <input type="file" accept="image/*" onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (!f) return
                  setCropFile(f)
                  setZoom(1)
                  setOffset({ x: 0, y: 0 })
                  setCropOpen(true)
                  if (e.target) e.target.value = ''
                }} />
                {uploading && <p className="text-sm text-muted-foreground">Mengunggah…</p>}
              </CardContent>
            </Card>
            <CropDialog
              open={cropOpen}
              onOpenChange={setCropOpen}
              file={cropFile}
              zoom={zoom}
              setZoom={setZoom}
              offset={offset}
              setOffset={setOffset}
              onConfirm={async ({ cx, cy, cw, ch }) => {
                if (!cropFile) return
                setUploading(true)
                try {
                  const form = new FormData()
                  form.append('file', cropFile)
                  form.append('cx', String(cx))
                  form.append('cy', String(cy))
                  form.append('cw', String(cw))
                  form.append('ch', String(ch))
                  const res = await fetch(`/api/products/${product.id}/media/upload`, { method: 'POST', body: form })
                  const data = await res.json()
                  if (!res.ok) throw new Error(data?.error || 'Upload gagal')
                  setImages((prev) => [{ id: data.media.id, url: data.media.url, label: data.media.label, metadata: null, variantId: null }, ...prev])
                  toast({ title: 'Upload sukses', description: 'Gambar ditambahkan.' })
                  setCropOpen(false)
                  setCropFile(null)
                } catch (err) {
                  console.error(err)
                  toast({ title: 'Upload gagal', description: err instanceof Error ? err.message : 'Coba lagi.', variant: 'destructive' })
                } finally {
                  setUploading(false)
                }
              }}
            />
          </TabsContent>

          <TabsContent value="resources">
            <Card>
              <CardHeader>
                <CardTitle>Resources</CardTitle>
                <CardDescription>Datasheets, CAD files, and documentation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Datasheets
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {product.datasheets.length > 0 ? (
                      product.datasheets.map((datasheet) => (
                        <Button
                          key={datasheet.id}
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a href={datasheet.url} target="_blank" rel="noreferrer">
                            {datasheet.label ?? 'Datasheet'}
                          </a>
                        </Button>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No datasheets available.</p>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    CAD Files
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {product.cadFiles.length > 0 ? (
                      product.cadFiles.map((cad) => (
                        <Button key={cad.id} variant="outline" size="sm" asChild>
                          <a href={cad.url} target="_blank" rel="noreferrer">
                            {cad.label ?? 'CAD'}
                          </a>
                        </Button>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No CAD files available.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Activity Summary</CardTitle>
                <CardDescription>Usage insights captured by the learning engine</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg border p-4">
                  <h4 className="text-sm text-muted-foreground">Search Visibility</h4>
                  <p className="text-2xl font-semibold mt-2">{product.viewCount}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    Views captured from search
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <h4 className="text-sm text-muted-foreground">Schedule Usage</h4>
                  <p className="text-2xl font-semibold mt-2">{product.usageCount}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    Items added into schedules
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <h4 className="text-sm text-muted-foreground">Variants</h4>
                  <p className="text-2xl font-semibold mt-2">{product.variants.length}</p>
                  <p className="text-xs text-muted-foreground">Total available configurations</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Related Products</h2>
              <p className="text-muted-foreground text-sm">Products from the same type or brand</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
              Explore Catalog
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedProducts.length ? (
              relatedProducts.map((related) => (
                <Card key={related.id}>
                  <CardContent className="p-4 space-y-3">
                    <div className="aspect-video bg-muted rounded-md overflow-hidden">
                      <Image
                        src={related.image || '/api/placeholder/300/200'}
                        alt={related.name}
                        width={320}
                        height={180}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{related.brandName}</p>
                      <h3 className="font-semibold">{related.name}</h3>
                      {/* Harga disembunyikan pada related products */}
                    </div>
                    <Button variant="outline" className="w-full" onClick={() => router.push(`/product/${related.id}`)}>
                      View Product
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-sm text-muted-foreground col-span-full">No related products available.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

export default ProductDetailClient

function CropDialog({
  open,
  onOpenChange,
  file,
  zoom,
  setZoom,
  offset,
  setOffset,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  file: File | null
  zoom: number
  setZoom: (v: number) => void
  offset: { x: number; y: number }
  setOffset: (o: { x: number; y: number }) => void
  onConfirm: (crop: { cx: number; cy: number; cw: number; ch: number }) => void
}) {
  const [imgUrl, setImgUrl] = useState<string | null>(null)
  const [natural, setNatural] = useState({ w: 0, h: 0 })
  const size = 320

  useEffect(() => {
    if (!file) { setImgUrl(null); return }
    const url = URL.createObjectURL(file)
    setImgUrl(url)
    const i = new Image()
    i.onload = () => setNatural({ w: i.naturalWidth, h: i.naturalHeight })
    i.src = url
    return () => URL.revokeObjectURL(url)
  }, [file])

  const onMouseDown: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const start = { x: e.clientX, y: e.clientY }
    const startOffset = { ...offset }
    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - start.x
      const dy = ev.clientY - start.y
      setOffset({ x: startOffset.x + dx, y: startOffset.y + dy })
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const doConfirm = () => {
    if (!imgUrl) return
    const fit = fitContain(natural.w, natural.h, size, size)
    const drawW = fit.w * zoom
    const drawH = fit.h * zoom
    const imgLeft = (size - drawW) / 2 + offset.x
    const imgTop = (size - drawH) / 2 + offset.y
    const visLeft = Math.max(0, -imgLeft)
    const visTop = Math.max(0, -imgTop)
    const visWidth = Math.min(size, imgLeft + drawW) - Math.max(0, imgLeft)
    const visHeight = Math.min(size, imgTop + drawH) - Math.max(0, imgTop)
    const cw = Math.max(1, visWidth * (natural.w / drawW))
    const ch = Math.max(1, visHeight * (natural.h / drawH))
    const cx = Math.max(0, visLeft * (natural.w / drawW))
    const cy = Math.max(0, visTop * (natural.h / drawH))
    onConfirm({ cx: Math.floor(cx), cy: Math.floor(cy), cw: Math.floor(cw), ch: Math.floor(ch) })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Crop Thumbnail</DialogTitle>
          <DialogDescription>Geser & zoom gambar agar pas di kotak.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div
            className="relative rounded-lg border bg-muted/50"
            style={{ width: size, height: size, overflow: 'hidden', margin: '0 auto', cursor: 'grab' }}
            onMouseDown={onMouseDown}
          >
            {imgUrl && (
              <img
                src={imgUrl}
                alt="crop"
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${zoom})`,
                  width: `${fitContain(natural.w, natural.h, size, size).w}px`,
                  height: `${fitContain(natural.w, natural.h, size, size).h}px`,
                  userSelect: 'none',
                  pointerEvents: 'none',
                }}
              />
            )}
          </div>
          <div className="flex items-center gap-3">
            <Label className="min-w-16">Zoom</Label>
            <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="flex-1" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
            <Button onClick={doConfirm}>Crop & Upload</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function fitContain(nw: number, nh: number, cw: number, ch: number) {
  const ar = nw / nh
  const car = cw / ch
  if (ar > car) {
    return { w: cw, h: Math.round(cw / ar) }
  }
  return { w: Math.round(ch * ar), h: ch }
}
