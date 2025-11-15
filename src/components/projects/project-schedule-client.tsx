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
  const [materialTypes, setMaterialTypes] = useState<string[]>([])
  const [productTypes, setProductTypes] = useState<{ id: string; name: string }[]>([])
  const [skuOptions, setSkuOptions] = useState<Record<string, ProductOption[]>>({})
  const [loading, setLoading] = useState(true)
  const fileRef = useRef<HTMLInputElement | null>(null)
  const USER_ID = 'anonymous'
  const [showAdd, setShowAdd] = useState(false)
  const [newNotes, setNewNotes] = useState('')

  useEffect(() => {
    fetchItems()
    fetchMeta()
  }, [scheduleId])

  const fetchItems = async () => {
    setLoading(true)
    const res = await fetch(`/api/schedule/items?scheduleId=${scheduleId}`)
    const data = await res.json()
    setItems(data.items || [])
    setLoading(false)
  }

  const handleImportCSV = async (file: File) => {
    const form = new FormData()
    form.append('file', file)
    form.append('scheduleId', scheduleId)
    form.append('userId', USER_ID)
    const res = await fetch('/api/schedule/items/import', { method: 'POST', body: form })
    if (res.ok) await fetchItems()
    if (fileRef.current) fileRef.current.value = ''
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
    const unique = new Set<string>()
    items.forEach((i) => {
      const t = String(i.attributes?.materialType || '').trim()
      if (t) unique.add(t)
    })
    setMaterialTypes(Array.from(unique))
  }

  const saveInline = async (itemId: string, patch: Partial<Item> & { materialType?: string }) => {
    const item = items.find((i) => i.id === itemId)
    if (!item) return
    const body = {
      itemId,
      updates: {
        productId: patch.productId ?? item.productId ?? null,
        productName: patch.productName ?? item.productName,
        brandName: patch.brandName ?? item.brandName,
        sku: patch.sku ?? item.sku,
        quantity: patch.quantity ?? item.quantity,
        unitOfMeasure: patch.unitOfMeasure ?? item.unitOfMeasure,
        area: patch.area ?? item.area ?? null,
        notes: patch.notes ?? item.notes ?? null,
        attributes: { ...(item.attributes || {}), materialType: patch.materialType ?? item.attributes?.materialType },
      },
    }
    const res = await fetch('/api/schedule/items', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (res.ok) {
      const data = await res.json()
      setItems((prev) => prev.map((i) => (i.id === data.item.id ? data.item : i)))
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
                  <Button size="sm">Add Material</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Material</DialogTitle>
                    <DialogDescription>Tambah satu baris kosong ke schedule ini.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div>
                      <Label>Notes (optional)</Label>
                      <Input
                        value={newNotes}
                        onChange={(e) => setNewNotes(e.target.value)}
                        placeholder="Optional notes"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
                      <Button
                        onClick={async () => {
                          try {
                            const res = await fetch('/api/schedule/items/manual', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                scheduleId,
                                userId: USER_ID,
                                notes: newNotes,
                              }),
                            })
                            const data = await res.json()
                            if (res.ok && data.item) {
                              setItems((prev) => [data.item, ...prev])
                              setShowAdd(false)
                              setNewNotes('')
                            } else {
                              console.error('Add material failed', data)
                            }
                          } catch (err) {
                            console.error('Add material error', err)
                          }
                        }}
                      >
                        Add
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
                    <TableRow key={item.id}>
                      <TableCell>
                        <Input
                          value={String((item.attributes && item.attributes.code) || '')}
                          readOnly
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={String(item.attributes?.materialType || '')}
                          onValueChange={(value) => saveInline(item.id, { materialType: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {materialTypes.map((t) => (
                              <SelectItem key={t} value={t}>
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={item.brandName || ''}
                          onValueChange={(value) => saveInline(item.id, { brandName: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select brand" />
                          </SelectTrigger>
                          <SelectContent>
                            {brands.map((b) => (
                              <SelectItem key={b.id} value={b.name}>
                                {b.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input value={item.sku} readOnly />
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {item.notes || '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => item.productId && router.push(`/product/${item.productId}`)}>
                          Edit Product
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!items.length && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">No items. Import CSV atau tambahkan dari Search.</TableCell>
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
