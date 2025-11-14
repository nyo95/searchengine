'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

type Props = {
  productId: string
  description?: string | null
  variants: Array<{ id: string; name: string }>
}

export default function ProductEditorClient({ productId, description, variants }: Props) {
  const [desc, setDesc] = useState(description || '')
  const [mediaUrl, setMediaUrl] = useState('')
  const [mediaLabel, setMediaLabel] = useState('')
  const [variantName, setVariantName] = useState('')
  const [variantPrice, setVariantPrice] = useState('')
  const [variantAttrs, setVariantAttrs] = useState('')

  const saveDesc = async () => {
    await fetch(`/api/products/${productId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: desc }),
    })
  }

  const addMedia = async () => {
    if (!mediaUrl) return
    await fetch(`/api/products/${productId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: mediaUrl, label: mediaLabel }),
    })
    setMediaUrl(''); setMediaLabel('')
  }

  const addVariant = async () => {
    if (!variantName) return
    let attributes: any = {}
    if (variantAttrs.trim()) {
      try { attributes = JSON.parse(variantAttrs) } catch { /* ignore */ }
    }
    await fetch(`/api/products/${productId}/variants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: variantName, price: Number(variantPrice) || undefined, attributes }),
    })
    setVariantName(''); setVariantPrice(''); setVariantAttrs('')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Detail Editor</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="text-sm">Description</label>
          <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} />
          <Button onClick={saveDesc}>Save</Button>
        </div>

        <div className="space-y-3">
          <label className="text-sm">Add Image/Media URL</label>
          <Input value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} placeholder="https://..." />
          <Input value={mediaLabel} onChange={(e) => setMediaLabel(e.target.value)} placeholder="Label (optional)" />
          <Button onClick={addMedia}>Add Media</Button>
        </div>

        <div className="space-y-3 md:col-span-2">
          <label className="text-sm">Add Variant</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Input value={variantName} onChange={(e) => setVariantName(e.target.value)} placeholder="Variant name" />
            <Input value={variantPrice} onChange={(e) => setVariantPrice(e.target.value)} placeholder="Price (optional)" />
            <Input value={variantAttrs} onChange={(e) => setVariantAttrs(e.target.value)} placeholder='Attributes JSON e.g. {"color":"Black"}' />
          </div>
          <Button onClick={addVariant}>Add Variant</Button>
        </div>

        <div className="md:col-span-2 space-y-2">
          <p className="text-sm text-muted-foreground">Existing Variants</p>
          <ul className="list-disc pl-5 text-sm">
            {variants.map((v) => (
              <li key={v.id}>{v.name}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

