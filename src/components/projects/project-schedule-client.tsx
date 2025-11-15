'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table as UITable, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { FileTextIcon } from 'lucide-react'
import { toast } from 'sonner'

type Item = {
  id: string
  productId?: string
  productName: string
  brandName: string
  sku: string
  attributes: Record<string, any>
  quantity: number
  unitOfMeasure: string
  area?: string | null
  notes?: string | null
}

type ProductOption = {
  id: string
  sku: string
  name: string
  brandId: string
  brandName: string
  productTypeId: string
  productTypeName: string
}

type ProjectScheduleClientProps = {
  scheduleId: string
}

export function ProjectScheduleClient({ scheduleId }: ProjectScheduleClientProps) {
  const router = useRouter()
  const [items, setItems] = useState<Item[]>([])
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([])
  const [productTypes, setProductTypes] = useState<{ id: string; name: string }[]>([])
  const [skuOptions, setSkuOptions] = useState<Record<string, ProductOption[]>>({})
  const [loading, setLoading] = useState(true)
  const fileRef = useRef<HTMLInputElement | null>(null)
  const USER_ID = 'anonymous'
  const [showAdd, setShowAdd] = useState(false)
  const [newProduct, setNewProduct] = useState({ brandId: '', productTypeId: '', sku: '', name: '', notes: '' })

  useEffect(() => {
    fetchItems()
    fetchMeta()
  }, [scheduleId])

  const fetchSkus = async (itemId: string, brandName: string, productTypeName: string) => {
    if (!brandName || !productTypeName) {
      setSkuOptions((prev) => ({ ...prev, [itemId]: [] }))
      return
    }
    try {
      const res = await fetch(`/api/search?brand=${encodeURIComponent(brandName)}&productType=${encodeURIComponent(productTypeName)}`)
      if (!res.ok) throw new Error('Failed to fetch SKUs')
      const data = await res.json()
      const options: ProductOption[] = (data.products || []).map((p: any) => ({
        id: p.id, sku: p.sku, name: p.name, brandId: p.brandId, brandName: p.brand.name, productTypeId: p.productTypeId, productTypeName: p.productType.name,
      }))
      setSkuOptions((prev) => ({ ...prev, [itemId]: options }))
    } catch (error) {
      console.error('Fetch SKU error:', error)
      setSkuOptions((prev) => ({ ...prev, [itemId]: [] }))
    }
  }

  const fetchItems = async () => {
    setLoading(true)
    const res = await fetch(`/api/schedule/items?scheduleId=${scheduleId}`)
    const data = await res.json()
    const fetchedItems: Item[] = data.items || []
    setItems(fetchedItems)
    setLoading(false)
    fetchedItems.forEach(item => {
      const materialType = item.attributes?.materialType
      if (item.brandName && materialType) {
        fetchSkus(item.id, item.brandName, materialType)
      }
    })
  }

  const handleImportCSV = async (file: File) => {
    const toastId = toast.loading('Mengimpor CSV...')
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('scheduleId', scheduleId)
      form.append('userId', USER_ID)
      const res = await fetch('/api/schedule/items/import', { method: 'POST', body: form })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Gagal mengimpor CSV' }))
        throw new Error(errorData.error)
      }

      await fetchItems()
      toast.success('CSV berhasil diimpor', { id: toastId })
    } catch (error: any) {
      console.error('Import CSV error:', error)
      toast.error(`Gagal mengimpor: ${error.message}`, { id: toastId })
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const fetchMeta = async () => {
    const [metaRes, typesRes] = await Promise.all([
      fetch('/api/catalog/meta'),
      fetch('/api/catalog/product-types'),
    ])
    const meta = await metaRes.json()
    const typesData = await typesRes.json()
    setBrands((meta.brands || []).map((b: any) => ({ id: b.id, name: b.name })))
    setProductTypes((typesData.productTypes || []).map((pt: any) => ({ id: pt.id, name: pt.name })))
  }

  const saveInline = async (itemId: string, patch: Partial<Item> & { brandId?: string, productTypeId?: string }) => {
    const item = items.find((i) => i.id === itemId)
    if (!item) return

    const toastId = toast.loading('Menyimpan perubahan...')
    try {
      const updatesPayload: any = { ...patch }

      // Look up brandName from brandId if present
      if (patch.brandId) {
          const brand = brands.find(b => b.id === patch.brandId)
          updatesPayload.brandName = brand?.name
      }

      // Look up materialType from productTypeId if present
      if (patch.productTypeId) {
          const productType = productTypes.find(pt => pt.id === patch.productTypeId)
          updatesPayload.materialType = productType?.name
      }

      const body = { itemId, updates: patch }
      const res = await fetch('/api/schedule/items', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) throw new Error('Gagal menyimpan ke server')

      const data = await res.json()
      setItems((prev) => prev.map((i) => (i.id === data.item.id ? data.item : i)))
      toast.success('Perubahan berhasil disimpan', { id: toastId })
    } catch (error) {
      console.error('Save inline error:', error)
      toast.error('Gagal menyimpan perubahan', { id: toastId })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Project Material Schedule</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.push('/projects')}>Back to Projects</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Items</CardTitle>
            <div className="flex items-center gap-2">
              <input ref={fileRef as any} type="file" accept=".csv" className="hidden" onChange={(e) => {
                const f = e.target.files?.[0]; if (f) handleImportCSV(f)
              }} />
              <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>Import CSV</Button>
              <Button variant="outline" size="sm" disabled>Export PDF</Button>
              <Dialog open={showAdd} onOpenChange={setShowAdd}>
                <DialogTrigger asChild>
                  <Button size="sm">Tambah Produk Baru</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Tambah Produk Baru ke Katalog</DialogTitle>
                    <DialogDescription>
                      Buat produk baru dan tambahkan ke jadwal ini.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Brand</Label>
                      <Select value={newProduct.brandId} onValueChange={(value) => setNewProduct(p => ({ ...p, brandId: value }))}>
                        <SelectTrigger><SelectValue placeholder="Pilih Brand" /></SelectTrigger>
                        <SelectContent>{brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Product Type</Label>
                      <Select value={newProduct.productTypeId} onValueChange={(value) => setNewProduct(p => ({ ...p, productTypeId: value }))}>
                        <SelectTrigger><SelectValue placeholder="Pilih Tipe Produk" /></SelectTrigger>
                        <SelectContent>{productTypes.map(pt => <SelectItem key={pt.id} value={pt.id}>{pt.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>SKU</Label>
                      <Input value={newProduct.sku} onChange={(e) => setNewProduct(p => ({ ...p, sku: e.target.value }))} placeholder="SKU Produk" />
                    </div>
                    <div>
                      <Label>Product Name</Label>
                      <Input value={newProduct.name} onChange={(e) => setNewProduct(p => ({ ...p, name: e.target.value }))} placeholder="Nama Produk" />
                    </div>
                    <div>
                      <Label>Notes (optional)</Label>
                      <Input value={newProduct.notes} onChange={(e) => setNewProduct(p => ({ ...p, notes: e.target.value }))} placeholder="Catatan tambahan" />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
                      <Button
                        disabled={!newProduct.brandId || !newProduct.productTypeId || !newProduct.sku || !newProduct.name}
                        onClick={async () => {
                          const toastId = toast.loading('Membuat produk baru...')
                          try {
                            // 1. Create new product in catalog
                            const productRes = await fetch('/api/products', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                name: newProduct.name,
                                sku: newProduct.sku,
                                brandId: newProduct.brandId,
                                productTypeId: newProduct.productTypeId,
                              }),
                            })

                            if (!productRes.ok) {
                              throw new Error('Gagal membuat produk')
                            }
                            const { product } = await productRes.json()
                            toast.loading('Menambahkan produk ke jadwal...', { id: toastId })

                            // 2. Add the new product to the current schedule
                            const selectedBrand = brands.find(b => b.id === newProduct.brandId)
                            const selectedProductType = productTypes.find(pt => pt.id === newProduct.productTypeId)

                            const scheduleItemRes = await fetch('/api/schedule/items', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    scheduleId,
                                    userId: USER_ID,
                                    productId: product.id,
                                    productName: product.name,
                                    brandName: selectedBrand?.name || '',
                                    sku: product.sku,
                                    notes: newProduct.notes,
                                    attributes: {
                                        materialType: selectedProductType?.name || '',
                                    },
                                }),
                            })

                            if (!scheduleItemRes.ok) {
                                throw new Error('Gagal menambahkan produk ke jadwal')
                            }

                            // 3. Reset form and refresh schedule
                            setNewProduct({ brandId: '', productTypeId: '', sku: '', name: '', notes: '' })
                            setShowAdd(false)
                            await fetchItems()
                            toast.success('Produk berhasil dibuat dan ditambahkan', { id: toastId })

                          } catch (error: any) {
                            console.error('Failed to create and add new product', error)
                            toast.error(`Operasi gagal: ${error.message}`, { id: toastId })
                          }
                        }}
                      >
                        Create and Add
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <UITable>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Material Type</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id} className={item.productId ? 'bg-muted/50' : ''}>
                      <TableCell>
                        <Input
                          value={String((item.attributes && item.attributes.code) || '')}
                          readOnly
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={productTypes.find(pt => pt.name === item.attributes?.materialType)?.id || ''}
                          onValueChange={(value) => {
                              const productType = productTypes.find(pt => pt.id === value)
                              if (productType) {
                                  saveInline(item.id, { productTypeId: value, sku: '', productId: null, productName: 'Belum terhubung' })
                                  fetchSkus(item.id, item.brandName, productType.name)
                              }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Belum dipilih" />
                          </SelectTrigger>
                          <SelectContent>
                            {productTypes.map((pt) => (
                              <SelectItem key={pt.id} value={pt.id}>
                                {pt.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={brands.find(b => b.name === item.brandName)?.id || ''}
                          onValueChange={(value) => {
                            const brand = brands.find(b => b.id === value)
                            if (brand) {
                                saveInline(item.id, { brandId: value, sku: '', productId: null, productName: 'Belum terhubung' })
                                fetchSkus(item.id, brand.name, item.attributes?.materialType)
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Belum dipilih" />
                          </SelectTrigger>
                          <SelectContent>
                            {brands.map((b) => (
                              <SelectItem key={b.id} value={b.id}>
                                {b.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={item.sku || ''}
                          disabled={!item.brandName || !item.attributes?.materialType}
                          onValueChange={(value) => {
                            const selectedProduct = skuOptions[item.id]?.find(p => p.sku === value)
                            if (selectedProduct) {
                              saveInline(item.id, {
                                sku: value,
                                productId: selectedProduct.id,
                                productName: selectedProduct.name,
                              })
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Belum terhubung" />
                          </SelectTrigger>
                          <SelectContent>
                            {(skuOptions[item.id] || []).map((p) => (
                              <SelectItem key={p.id} value={p.sku}>
                                {p.sku}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {item.notes ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <FileTextIcon className="h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{item.notes}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!item.productId}
                          onClick={() => item.productId && router.push(`/product/${item.productId}`)}
                        >
                          Edit Product
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!items.length && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">No items. Import CSV atau tambahkan dari Search.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </UITable>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
