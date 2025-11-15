'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Badge,
  Box,
  CheckCircle2,
  ImageIcon,
  Loader2,
  PlusCircle,
  RefreshCw,
  Search,
  UploadCloud,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

type CatalogOption = {
  id: string
  name: string
}

type CategoryOption = CatalogOption & { parentId?: string | null }

type ProductTypeOption = {
  id: string
  name: string
  brandId: string
  subcategoryId?: string | null
  subcategoryName?: string | null
  categoryId?: string | null
  categoryName?: string | null
}

type ProductListItem = {
  id: string
  sku: string
  name: string
  brandName: string
  productTypeName: string
}

const MAX_IMAGES = 2

export default function AdminDashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [products, setProducts] = useState<ProductListItem[]>([])
  const [productSearch, setProductSearch] = useState('')
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const [metaLoaded, setMetaLoaded] = useState(false)
  const [brandOptions, setBrandOptions] = useState<CatalogOption[]>([])
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([])
  const [productTypeOptions, setProductTypeOptions] = useState<ProductTypeOption[]>([])

  const [formState, setFormState] = useState({
    name: '',
    nameEn: '',
    sku: '',
    description: '',
    basePrice: '',
    keywords: '',
    brandId: '',
    categoryId: '',
    subcategoryId: '',
    productTypeId: '',
    variantName: '',
    variantPrice: '',
  })
  const [attributeRows, setAttributeRows] = useState<Array<{ key: string; value: string }>>([{ key: '', value: '' }])
  const [variantAttributeRows, setVariantAttributeRows] = useState<Array<{ key: string; value: string }>>([
    { key: '', value: '' },
  ])
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchMetadata()
    fetchProducts()
  }, [])

  const topLevelCategories = useMemo(() => categoryOptions.filter((category) => !category.parentId), [categoryOptions])
  const subcategories = useMemo(
    () => categoryOptions.filter((category) => !!category.parentId && category.parentId === formState.categoryId),
    [categoryOptions, formState.categoryId],
  )

  const filteredProductTypes = useMemo(() => {
    return productTypeOptions.filter((type) => {
      if (formState.brandId && type.brandId !== formState.brandId) return false
      if (formState.subcategoryId && type.subcategoryId !== formState.subcategoryId) return false
      return true
    })
  }, [productTypeOptions, formState.brandId, formState.subcategoryId])

  const fetchMetadata = async () => {
    try {
      const [metaRes, typeRes] = await Promise.all([fetch('/api/catalog/meta'), fetch('/api/catalog/product-types')])
      if (!metaRes.ok || !typeRes.ok) {
        throw new Error('Failed to load metadata')
      }
      const meta = await metaRes.json()
      const typeData = await typeRes.json()
      setBrandOptions((meta.brands || []).map((brand: any) => ({ id: brand.id, name: brand.name })))
      setCategoryOptions(
        (meta.categories || []).map(
          (category: any) =>
            ({
              id: category.id,
              name: category.name,
              parentId: category.parentId ?? null,
            }) as CategoryOption,
        ),
      )
      setProductTypeOptions(
        (typeData.productTypes || []).map(
          (type: any) =>
            ({
              id: type.id,
              name: type.name,
              brandId: type.brandId,
              subcategoryId: type.subcategory?.id ?? type.subcategoryId ?? null,
              subcategoryName: type.subcategory?.name ?? null,
              categoryId: type.subcategory?.parent?.id ?? null,
              categoryName: type.subcategory?.parent?.name ?? null,
            }) as ProductTypeOption,
        ),
      )
      setMetaLoaded(true)
    } catch (error) {
      console.error(error)
      toast({
        title: 'Gagal memuat metadata',
        description: 'Tidak dapat memuat daftar brand/kategori.',
        variant: 'destructive',
      })
    }
  }

  const fetchProducts = async () => {
    setIsLoadingProducts(true)
    try {
      const params = new URLSearchParams()
      if (productSearch.trim()) params.set('q', productSearch.trim())
      const response = await fetch(`/api/catalog/products?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to load products')
      const data = await response.json()
      setProducts(
        (data.products || []).map(
          (product: any) =>
            ({
              id: product.id,
              sku: product.sku,
              name: product.name,
              brandName: product.brandName ?? product.brand?.name ?? '–',
              productTypeName: product.productTypeName ?? product.productType?.name ?? '–',
            }) as ProductListItem,
        ),
      )
    } catch (error) {
      console.error(error)
      toast({
        title: 'Gagal memuat produk',
        description: 'Pastikan API katalog aktif.',
        variant: 'destructive',
      })
    } finally {
      setIsLoadingProducts(false)
    }
  }

  const handleFormChange = (field: keyof typeof formState, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }))
    if (field === 'brandId') {
      setFormState((prev) => ({ ...prev, productTypeId: '' }))
    }
    if (field === 'categoryId') {
      setFormState((prev) => ({ ...prev, subcategoryId: '', productTypeId: '' }))
    }
  }

  const updateAttributeRows = (
    rows: Array<{ key: string; value: string }>,
    setter: typeof setAttributeRows,
    index: number,
    field: 'key' | 'value',
    value: string,
  ) => {
    const next = [...rows]
    next[index] = { ...next[index], [field]: value }
    setter(next)
  }

  const addAttributeRow = (setter: typeof setAttributeRows) => {
    setter((prev) => [...prev, { key: '', value: '' }])
  }

  const handleImagesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setSelectedImages(files.slice(0, MAX_IMAGES))
  }

  const buildAttributesObject = (rows: Array<{ key: string; value: string }>) => {
    return rows.reduce<Record<string, string>>((acc, row) => {
      if (row.key.trim()) {
        acc[row.key.trim()] = row.value
      }
      return acc
    }, {})
  }

  const resetForm = () => {
    setFormState({
      name: '',
      nameEn: '',
      sku: '',
      description: '',
      basePrice: '',
      keywords: '',
      brandId: '',
      categoryId: '',
      subcategoryId: '',
      productTypeId: '',
      variantName: '',
      variantPrice: '',
    })
    setAttributeRows([{ key: '', value: '' }])
    setVariantAttributeRows([{ key: '', value: '' }])
    setSelectedImages([])
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!formState.brandId || !formState.productTypeId) {
      toast({ title: 'Lengkapi brand & tipe', description: 'Form belum lengkap.', variant: 'destructive' })
      return
    }
    if (!formState.name.trim() || !formState.sku.trim()) {
      toast({ title: 'Nama & SKU wajib', variant: 'destructive' })
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        sku: formState.sku.trim(),
        name: formState.name.trim(),
        nameEn: formState.nameEn.trim() || undefined,
        description: formState.description.trim() || undefined,
        brandId: formState.brandId,
        productTypeId: formState.productTypeId,
        categoryId: formState.categoryId || formState.subcategoryId || undefined,
        basePrice: formState.basePrice ? parseFloat(formState.basePrice) : undefined,
        keywords: formState.keywords,
      }

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error?.error || 'Gagal membuat produk')
      }
      const { product } = await response.json()

      if (formState.variantName.trim() || formState.variantPrice || Object.keys(buildAttributesObject(variantAttributeRows)).length) {
        await fetch(`/api/products/${product.id}/variants`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formState.variantName.trim() || `${formState.name.trim()} Variant`,
            price: formState.variantPrice ? parseFloat(formState.variantPrice) : undefined,
            attributes: buildAttributesObject(variantAttributeRows),
          }),
        })
      }

      for (const file of selectedImages) {
        const fd = new FormData()
        fd.append('file', file)
        await fetch(`/api/products/${product.id}/media/upload`, {
          method: 'POST',
          body: fd,
        })
      }

      toast({
        title: 'Produk dibuat',
        description: `${product.name} berhasil ditambahkan ke katalog.`,
      })
      resetForm()
      fetchProducts()
    } catch (error: any) {
      console.error(error)
      toast({
        title: 'Gagal menyimpan produk',
        description: error?.message || 'Terjadi kesalahan.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Admin Dashboard</p>
            <h1 className="text-2xl font-semibold">Material Curator Control</h1>
          </div>
          <Badge variant="outline" className="flex items-center gap-2">
            <Box className="h-4 w-4" />
            Mode Admin
          </Badge>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[420px]">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Produk
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Tambah Produk
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>Daftar Produk</CardTitle>
                <CardDescription>Telusuri katalog lalu buka detail untuk kurasi lanjutan.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    placeholder="Cari SKU atau nama produk"
                    value={productSearch}
                    onChange={(event) => setProductSearch(event.target.value)}
                    className="w-full flex-1 min-w-[240px]"
                  />
                  <Button variant="outline" onClick={fetchProducts} disabled={isLoadingProducts}>
                    {isLoadingProducts ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
                  </Button>
                  <Button variant="ghost" onClick={() => { setProductSearch(''); fetchProducts() }} disabled={isLoadingProducts}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>SKU</TableHead>
                        <TableHead>Nama</TableHead>
                        <TableHead>Brand</TableHead>
                        <TableHead>Tipe</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingProducts ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center">
                            <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                          </TableCell>
                        </TableRow>
                      ) : products.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                            Tidak ada produk ditemukan. Gunakan pencarian atau tambah produk baru.
                          </TableCell>
                        </TableRow>
                      ) : (
                        products.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                            <TableCell>{product.name}</TableCell>
                            <TableCell>{product.brandName}</TableCell>
                            <TableCell>{product.productTypeName}</TableCell>
                            <TableCell className="text-right">
                              <Button size="sm" variant="outline" onClick={() => router.push(`/product/${product.id}`)}>
                                Lihat Detail
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle>Tambah Produk Lengkap</CardTitle>
                <CardDescription>
                  Isi form detail berikut untuk menambah material baru lengkap dengan varian dan media.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Nama Produk</Label>
                      <Input value={formState.name} onChange={(event) => handleFormChange('name', event.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Nama (EN)</Label>
                      <Input value={formState.nameEn} onChange={(event) => handleFormChange('nameEn', event.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>SKU</Label>
                      <Input value={formState.sku} onChange={(event) => handleFormChange('sku', event.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Harga Dasar (opsional)</Label>
                      <Input
                        type="number"
                        inputMode="decimal"
                        value={formState.basePrice}
                        onChange={(event) => handleFormChange('basePrice', event.target.value)}
                        placeholder="cth: 1250000"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Deskripsi</Label>
                    <Textarea
                      rows={4}
                      value={formState.description}
                      onChange={(event) => handleFormChange('description', event.target.value)}
                      placeholder="Spesifikasi singkat, finishing, dsb."
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Brand</Label>
                      <Select
                        value={formState.brandId || '__none__'}
                        onValueChange={(value) => handleFormChange('brandId', value === '__none__' ? '' : value)}
                        disabled={!metaLoaded}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih brand" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__" disabled>
                            Pilih brand
                          </SelectItem>
                          {brandOptions.map((brand) => (
                            <SelectItem key={brand.id} value={brand.id}>
                              {brand.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Kategori</Label>
                      <Select
                        value={formState.categoryId || '__none__'}
                        onValueChange={(value) => handleFormChange('categoryId', value === '__none__' ? '' : value)}
                        disabled={!topLevelCategories.length}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kategori utama" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__" disabled>
                            Pilih kategori
                          </SelectItem>
                          {topLevelCategories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Subkategori</Label>
                      <Select
                        value={formState.subcategoryId || '__none__'}
                        onValueChange={(value) => handleFormChange('subcategoryId', value === '__none__' ? '' : value)}
                        disabled={!subcategories.length}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih subkategori" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__" disabled>
                            Pilih subkategori
                          </SelectItem>
                          {subcategories.map((subcategory) => (
                            <SelectItem key={subcategory.id} value={subcategory.id}>
                              {subcategory.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Product Type</Label>
                    <Select
                      value={formState.productTypeId || '__none__'}
                      onValueChange={(value) => handleFormChange('productTypeId', value === '__none__' ? '' : value)}
                      disabled={!filteredProductTypes.length}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih tipe material" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__" disabled>
                          Pilih tipe
                        </SelectItem>
                        {filteredProductTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                            {type.subcategoryName ? ` · ${type.subcategoryName}` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Keywords (pisahkan dengan koma)</Label>
                    <Input
                      placeholder="marmer, travertine, slab"
                      value={formState.keywords}
                      onChange={(event) => handleFormChange('keywords', event.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Atribut Produk</Label>
                    <div className="space-y-3 rounded-lg border p-4">
                      {attributeRows.map((row, index) => (
                        <div key={`${index}-${row.key}`} className="grid gap-2 md:grid-cols-2">
                          <Input
                            placeholder="Nama atribut"
                            value={row.key}
                            onChange={(event) => updateAttributeRows(attributeRows, setAttributeRows, index, 'key', event.target.value)}
                          />
                          <Input
                            placeholder="Nilai atribut"
                            value={row.value}
                            onChange={(event) =>
                              updateAttributeRows(attributeRows, setAttributeRows, index, 'value', event.target.value)
                            }
                          />
                        </div>
                      ))}
                      <Button type="button" variant="ghost" size="sm" onClick={() => addAttributeRow(setAttributeRows)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Tambah atribut
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Informasi Variant Pertama</Label>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Nama Variant</Label>
                        <Input
                          value={formState.variantName}
                          onChange={(event) => handleFormChange('variantName', event.target.value)}
                          placeholder="cth: Sheet 240x120"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Harga Variant</Label>
                        <Input
                          type="number"
                          inputMode="decimal"
                          value={formState.variantPrice}
                          onChange={(event) => handleFormChange('variantPrice', event.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-3 rounded-lg border p-4">
                      {variantAttributeRows.map((row, index) => (
                        <div key={`variant-${index}`} className="grid gap-2 md:grid-cols-2">
                          <Input
                            placeholder="Atribut variant"
                            value={row.key}
                            onChange={(event) =>
                              updateAttributeRows(variantAttributeRows, setVariantAttributeRows, index, 'key', event.target.value)
                            }
                          />
                          <Input
                            placeholder="Nilai"
                            value={row.value}
                            onChange={(event) =>
                              updateAttributeRows(variantAttributeRows, setVariantAttributeRows, index, 'value', event.target.value)
                            }
                          />
                        </div>
                      ))}
                      <Button type="button" variant="ghost" size="sm" onClick={() => addAttributeRow(setVariantAttributeRows)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Tambah atribut variant
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Foto Produk (maks {MAX_IMAGES})</Label>
                    <div className="flex flex-col gap-2 rounded-lg border border-dashed p-4">
                      <div className="flex items-center gap-3">
                        <UploadCloud className="h-5 w-5 text-muted-foreground" />
                        <input type="file" multiple accept="image/*" onChange={handleImagesChange} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Gunakan foto resolusi tinggi. Sistem otomatis membuat thumbnail 1:1.
                      </p>
                      {selectedImages.length > 0 && (
                        <ul className="text-sm text-muted-foreground">
                          {selectedImages.map((file) => (
                            <li key={file.name} className="flex items-center gap-2">
                              <ImageIcon className="h-3 w-3" />
                              {file.name}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                      Simpan Produk
                    </Button>
                    <Button type="button" variant="ghost" onClick={resetForm} disabled={isSubmitting}>
                      Reset Form
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
