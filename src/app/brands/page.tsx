'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Table as UITable, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

type Node = { id: string; name: string }
type RootCat = { id: string; name: string; children: Node[] }

type Row = {
  id: string
  name: string
  nameEn?: string | null
  website?: string | null
  email?: string | null
  contact?: string | null
  categoryId: string
  subcategories: { id: string; name: string; salesEmail?: string | null; salesContact?: string | null }[]
  productsCount: number
}

export default function BrandsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categories, setCategories] = useState<RootCat[]>([])
  const [categoryId, setCategoryId] = useState<string>('ALL')
  const [subcategoryId, setSubcategoryId] = useState<string>('ALL')
  const [rows, setRows] = useState<Row[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [newBrand, setNewBrand] = useState({ name: '', categoryId: '', website: '', email: '', contact: '' })

  useEffect(() => {
    fetch('/api/catalog/categories').then(r => r.json()).then((d) => setCategories(d.categories || []))
  }, [])

  const subcats = useMemo(() => categories.find((c) => c.id === categoryId)?.children || [], [categories, categoryId])

  const fetchRows = async () => {
    setLoading(true)
    const p = new URLSearchParams()
    if (search.trim()) p.set('search', search.trim())
    if (categoryId !== 'ALL') p.set('categoryId', categoryId)
    if (subcategoryId !== 'ALL') p.set('subcategoryId', subcategoryId)
    const res = await fetch(`/api/brands?${p.toString()}`)
    const data = await res.json()
    setRows(data.brands || [])
    setLoading(false)
  }

  useEffect(() => { fetchRows() }, [categoryId, subcategoryId])

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold">Brands</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Filter</CardTitle>
            <Dialog open={showAdd} onOpenChange={setShowAdd}>
              <DialogTrigger asChild>
                <Button size="sm">Add Brand</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Brand</DialogTitle>
                  <DialogDescription>Tambah brand baru ke katalog.</DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={newBrand.name}
                      onChange={(e) => setNewBrand((b) => ({ ...b, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Select
                      value={newBrand.categoryId}
                      onValueChange={(v) => setNewBrand((b) => ({ ...b, categoryId: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Website</Label>
                    <Input
                      value={newBrand.website}
                      onChange={(e) => setNewBrand((b) => ({ ...b, website: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label>Email</Label>
                      <Input
                        value={newBrand.email}
                        onChange={(e) => setNewBrand((b) => ({ ...b, email: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Contact</Label>
                      <Input
                        value={newBrand.contact}
                        onChange={(e) => setNewBrand((b) => ({ ...b, contact: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
                    <Button
                      onClick={async () => {
                        if (!newBrand.name.trim() || !newBrand.categoryId) return
                        const res = await fetch('/api/brands', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(newBrand),
                        })
                        const data = await res.json()
                        if (res.ok && data.brand) {
                          setShowAdd(false)
                          setNewBrand({ name: '', categoryId: '', website: '', email: '', contact: '' })
                          await fetchRows()
                          router.push(`/brands/${data.brand.id}`)
                        } else {
                          console.error('Add brand failed', data)
                        }
                      }}
                      disabled={!newBrand.name.trim() || !newBrand.categoryId}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Input placeholder="Search brand name" value={search} onChange={(e) => setSearch(e.target.value)} />
            <Select value={categoryId} onValueChange={(v) => { setCategoryId(v); setSubcategoryId('ALL') }}>
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={subcategoryId} onValueChange={setSubcategoryId} disabled={categoryId === 'ALL'}>
              <SelectTrigger>
                <SelectValue placeholder="All subcategories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All subcategories</SelectItem>
                {subcats.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={fetchRows}>Apply</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Brand List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <UITable>
                <TableHeader>
                  <TableRow>
                    <TableHead>Brand</TableHead>
                    <TableHead>Website</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Subcategories</TableHead>
                    <TableHead>Products</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id} className="cursor-pointer" onClick={() => router.push(`/brands/${r.id}`)}>
                      <TableCell>{r.name}</TableCell>
                      <TableCell>{r.website}</TableCell>
                      <TableCell>{r.email}</TableCell>
                      <TableCell>{r.contact}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{r.subcategories.map((s) => s.name).join(', ')}</TableCell>
                      <TableCell>{r.productsCount}</TableCell>
                    </TableRow>
                  ))}
                  {!rows.length && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">No brands found.</TableCell>
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
