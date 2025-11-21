'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

type BrandDetailProps = {
  id: string
  name: string
  website?: string | null
  phone?: string | null
  salesName?: string | null
  salesContact?: string | null
  isActive?: boolean
}

export default function BrandDetailClient({ id, name, website, phone, salesName, salesContact, isActive }: BrandDetailProps) {
  const { toast } = useToast()
  const [formState, setFormState] = useState({
    name,
    website: website ?? '',
    phone: phone ?? '',
    salesName: salesName ?? '',
    salesContact: salesContact ?? '',
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/brands/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formState.name.trim(),
          website: formState.website.trim() || null,
          phone: formState.phone.trim() || null,
          salesName: formState.salesName.trim() || null,
          salesContact: formState.salesContact.trim() || null,
        }),
      })
      if (!response.ok) throw new Error('Failed to update brand')
      toast({ title: 'Brand diperbarui' })
    } catch (error: any) {
      console.error(error)
      toast({
        title: 'Gagal menyimpan',
        description: error?.message || 'Tidak dapat menyimpan brand.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (next: boolean) => {
    try {
      const response = await fetch(`/api/brands/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: next }),
      })
      if (!response.ok) throw new Error('Failed to update brand')
      toast({
        title: next ? 'Brand diaktifkan' : 'Brand dinonaktifkan',
      })
    } catch (error) {
      console.error(error)
      toast({
        title: 'Gagal menonaktifkan brand',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Nama Brand</Label>
          <Input
            value={formState.name}
            onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
          />
        </div>
        <div>
          <Label>Website</Label>
          <Input
            value={formState.website}
            onChange={(event) => setFormState((prev) => ({ ...prev, website: event.target.value }))}
          />
        </div>
        <div>
          <Label>Telepon</Label>
          <Input
            value={formState.phone}
            onChange={(event) => setFormState((prev) => ({ ...prev, phone: event.target.value }))}
          />
        </div>
        <div>
          <Label>Kontak Sales</Label>
          <Input
            value={formState.salesName}
            onChange={(event) => setFormState((prev) => ({ ...prev, salesName: event.target.value }))}
            placeholder="Nama sales"
            className="mb-2"
          />
          <Input
            value={formState.salesContact}
            onChange={(event) => setFormState((prev) => ({ ...prev, salesContact: event.target.value }))}
            placeholder="Email atau telepon sales"
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Menyimpan...' : 'Simpan'}
        </Button>
        <Button
          variant="outline"
          onClick={() => toggleActive(!(isActive ?? true))}
        >
          {isActive ? 'Nonaktifkan Brand' : 'Aktifkan Brand'}
        </Button>
      </div>
    </div>
  )
}
