"use client";

import { useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSearchProducts, useCreateProduct } from "@/hooks/useProducts";
import { useBrands } from "@/hooks/useBrands";
import { useSubcategories } from "@/hooks/useSubcategories";
import { toast } from "sonner";

function AttributeField({ field, value, onChange }: { field: any; value: any; onChange: (val: any) => void }) {
  const type = field.type || 'text'
  if (type === 'select' && Array.isArray(field.options)) {
    return (
      <Select value={value ?? ''} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={field.name} />
        </SelectTrigger>
        <SelectContent>
          {field.options.map((opt: string) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }
  return (
    <Input
      type={type === 'number' ? 'number' : 'text'}
      value={value ?? ''}
      onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
      placeholder={field.name}
    />
  )
}

export default function AdminMaterialsPage() {
  const [search, setSearch] = useState('')
  const { data: products, refetch } = useSearchProducts(search ? { search } : undefined)
  const { data: brands } = useBrands()
  const { data: subcategories } = useSubcategories()
  const createProduct = useCreateProduct()

  const [form, setForm] = useState({
    name: '',
    skuOrType: '',
    brandId: '',
    subcategoryId: '',
    attributes: {} as Record<string, any>,
  })

  const selectedTemplate = useMemo(
    () => subcategories?.find((s) => s.id === form.subcategoryId)?.defaultAttributesTemplate || [],
    [form.subcategoryId, subcategories],
  )

  const handleCreate = async () => {
    if (!form.name || !form.skuOrType || !form.brandId || !form.subcategoryId) {
      toast.error('Please complete all fields')
      return
    }

    const attributesData = Array.isArray(selectedTemplate)
      ? Object.fromEntries(selectedTemplate.map((field: any) => [field.name, form.attributes[field.name] ?? null]))
      : null

    await createProduct.mutateAsync({
      name: form.name,
      skuOrType: form.skuOrType,
      brandId: form.brandId,
      subcategoryId: form.subcategoryId,
      attributesData: attributesData || undefined,
    })
    setForm({ name: '', skuOrType: '', brandId: '', subcategoryId: '', attributes: {} })
    refetch()
  }

  return (
    <AppLayout>
      <div className="px-4 md:px-6 py-8 max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Add Material</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                placeholder="Product name"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />
              <Input
                placeholder="SKU / Type"
                value={form.skuOrType}
                onChange={(e) => setForm((p) => ({ ...p, skuOrType: e.target.value }))}
              />
              <Select value={form.brandId} onValueChange={(value) => setForm((p) => ({ ...p, brandId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Brand" />
                </SelectTrigger>
                <SelectContent>
                  {(brands || []).map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={form.subcategoryId}
                onValueChange={(value) => setForm((p) => ({ ...p, subcategoryId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {(subcategories || []).map((subcategory) => (
                    <SelectItem key={subcategory.id} value={subcategory.id}>
                      {subcategory.name} ({subcategory.prefix})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {Array.isArray(selectedTemplate) && selectedTemplate.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Dynamic Attributes</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedTemplate.map((field: any) => (
                    <div key={field.name} className="space-y-1">
                      <p className="text-xs text-muted-foreground">{field.name}</p>
                      <AttributeField
                        field={field}
                        value={form.attributes[field.name] ?? ''}
                        onChange={(val) => setForm((p) => ({ ...p, attributes: { ...p.attributes, [field.name]: val } }))}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button onClick={handleCreate}>Save Material</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Catalog</CardTitle>
            <Input
              placeholder="Search materials..."
              className="w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>SKU/Type</TableHead>
                    <TableHead>Subcategory</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(products || []).map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.brand.name}</TableCell>
                      <TableCell>{product.skuOrType}</TableCell>
                      <TableCell>{product.subcategory.name}</TableCell>
                    </TableRow>
                  ))}
                  {(products || []).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground text-sm">
                        No materials found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
