'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table as UITable, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

type BrandDetail = {
  id: string
  name: string
  nameEn?: string | null
  website?: string | null
  email?: string | null
  contact?: string | null
  categoryId: string
  categoryName: string
  subcategories: { id: string; name: string; salesEmail?: string | null; salesContact?: string | null }[]
}

type Cat = { id: string; name: string; parentId: string | null }

export default function BrandDetailClient({ brand, categories }: { brand: BrandDetail; categories: Cat[] }) {
  const { toast } = useToast()
  const [state, setState] = useState({ website: brand.website || '', email: brand.email || '', contact: brand.contact || '' })
  const [subs, setSubs] = useState(brand.subcategories)
  const [newSubId, setNewSubId] = useState<string>('')

  const saveMain = async () => {
    const res = await fetch(`/api/brands/${brand.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(state) })
    if (res.ok) toast({ title: 'Tersimpan', description: 'Informasi brand diperbarui.' })
  }

  const saveSub = async (sid: string, patch: { salesEmail?: string; salesContact?: string }) => {
    const res = await fetch(`/api/brands/${brand.id}/subcategory/${sid}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) })
    if (res.ok) {
      const data = await res.json()
      setSubs((prev) => prev.map((s) => (s.id === sid ? { ...s, salesEmail: data.link.salesEmail || '', salesContact: data.link.salesContact || '' } : s)))
      toast({ title: 'Tersimpan', description: 'Kontak subkategori diperbarui.' })
    }
  }

  const availableSubcats = categories.filter(
    (c) => c.parentId === brand.categoryId && !subs.some((s) => s.id === c.id),
  )

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold">{brand.name}</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Brand Information</CardTitle>
            <CardDescription>Edit website, email, contact</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label>Website</Label>
              <Input value={state.website} onChange={(e) => setState((s) => ({ ...s, website: e.target.value }))} />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={state.email} onChange={(e) => setState((s) => ({ ...s, email: e.target.value }))} />
            </div>
            <div>
              <Label>Contact</Label>
              <Input value={state.contact} onChange={(e) => setState((s) => ({ ...s, contact: e.target.value }))} />
            </div>
            <div className="md:col-span-3">
              <Button onClick={saveMain}>Save</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subcategory Contacts</CardTitle>
            <CardDescription>Kontak sales per subkategori (opsional)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-end gap-2 mb-4">
              <div className="flex-1">
                <Label>Link new subcategory</Label>
                <Input
                  value={newSubId}
                  onChange={(e) => setNewSubId(e.target.value)}
                  placeholder="e.g. High Pressure Laminate"
                  className="mt-1"
                />
              </div>
              <Button
                variant="outline"
                onClick={async () => {
                  const name = newSubId.trim()
                  if (!name) return
                  const res = await fetch(`/api/brands/${brand.id}/subcategory/by-name`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name }),
                  })
                  const data = await res.json()
                  if (res.ok && data.link && data.subcategory) {
                    setSubs((prev) => [
                      ...prev,
                      {
                        id: data.subcategory.id,
                        name: data.subcategory.name,
                        salesEmail: data.link.salesEmail,
                        salesContact: data.link.salesContact,
                      },
                    ])
                    setNewSubId('')
                    toast({ title: 'Subcategory linked', description: 'Brand linked to subcategory.' })
                  } else {
                    console.error('Link subcategory failed', data)
                  }
                }}
                disabled={!newSubId.trim()}
              >
                Add
              </Button>
            </div>
            <div className="overflow-x-auto">
              <UITable>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subcategory</TableHead>
                    <TableHead>Sales Email</TableHead>
                    <TableHead>Sales Contact</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subs.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>{s.name}</TableCell>
                      <TableCell>
                        <Input defaultValue={s.salesEmail || ''} onBlur={(e) => saveSub(s.id, { salesEmail: e.target.value })} />
                      </TableCell>
                      <TableCell>
                        <Input defaultValue={s.salesContact || ''} onBlur={(e) => saveSub(s.id, { salesContact: e.target.value })} />
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => saveSub(s.id, { salesEmail: s.salesEmail || '', salesContact: s.salesContact || '' })}>Save</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!subs.length && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">No subcategories linked.</TableCell>
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
