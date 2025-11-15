'use client'

import type { FormEvent } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { useSchedules, type ScheduleSummary } from '@/hooks/use-schedules'
import { AddProductDialog, type CatalogOption, type CatalogProductOption } from '@/components/product/add-product-dialog'

type ScheduleItem = {
  id: string
  productId: string | null
  productName: string
  brandId?: string | null
  brandName: string
  productTypeId?: string | null
  sku: string
  attributes: Record<string, any>
  quantity: number
  unitOfMeasure: string
  area?: string | null
  notes?: string | null
}

type CategoryOption = {
  id: string
  name: string
  parentId?: string | null
}

type ProductTypeOption = {
  id: string
  name: string
  brandId: string
  subcategoryId?: string | null
  subcategoryName?: string | null
  categoryId?: string | null
  categoryName?: string | null
}

type ProjectScheduleTabProps = {
  userId: string
  initialScheduleId?: string
}

export function ProjectScheduleTab({ userId, initialScheduleId }: ProjectScheduleTabProps) {
  const router = useRouter()
  const { toast } = useToast()

  const {
    schedules,
    isLoading: isScheduleLoading,
    refresh: refreshSchedules,
    createSchedule,
  } = useSchedules(userId)
  const [selectedScheduleId, setSelectedScheduleId] = useState(initialScheduleId || '')
  const [scheduleDetail, setScheduleDetail] = useState<ScheduleSummary | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [items, setItems] = useState<ScheduleItem[]>([])
  const [loadingItems, setLoadingItems] = useState(false)
  const [brands, setBrands] = useState<CatalogOption[]>([])
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [productTypes, setProductTypes] = useState<ProductTypeOption[]>([])
  const [nameDraft, setNameDraft] = useState('')
  const [isEditingName, setIsEditingName] = useState(false)
  const [savingSchedule, setSavingSchedule] = useState(false)
  const [savingItemId, setSavingItemId] = useState<string | null>(null)
  const [addingMaterial, setAddingMaterial] = useState(false)
  const [skuOptions, setSkuOptions] = useState<Record<string, CatalogProductOption[]>>({})
  const [skuLoadingState, setSkuLoadingState] = useState<Record<string, boolean>>({})
  const [manualProductRowId, setManualProductRowId] = useState<string | null>(null)
  const [nameDrafts, setNameDrafts] = useState<Record<string, string>>({})
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newScheduleName, setNewScheduleName] = useState('')
  const [newScheduleDescription, setNewScheduleDescription] = useState('')
  const [creatingSchedule, setCreatingSchedule] = useState(false)
  const [isRfVariantMode, setIsRfVariantMode] = useState(false)
  const [designerMode, setDesignerMode] = useState(true)

  const productTypeLookup = useMemo(() => {
    const map = new Map<string, ProductTypeOption>()
    productTypes.forEach((type) => map.set(type.id, type))
    return map
  }, [productTypes])

  const topLevelCategories = useMemo(() => categories.filter((category) => !category.parentId), [categories])

  const resetCreateForm = () => {
    setNewScheduleName('')
    setNewScheduleDescription('')
  }

  const handleCreateDialogChange = (open: boolean) => {
    setCreateDialogOpen(open)
    if (!open) {
      resetCreateForm()
    }
  }

  const handleCreateSchedule = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!newScheduleName.trim()) return
    setCreatingSchedule(true)
    try {
      const schedule = await createSchedule({
        name: newScheduleName.trim(),
        description: newScheduleDescription.trim() || undefined,
      })
      setSelectedScheduleId(schedule.id)
      setScheduleDetail(schedule)
      setItems([])
      toast({ title: 'Project schedule dibuat', description: schedule.name })
      handleCreateDialogChange(false)
    } catch (error) {
      console.error(error)
      toast({
        title: 'Gagal membuat schedule',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan, coba lagi.',
        variant: 'destructive',
      })
    } finally {
      setCreatingSchedule(false)
    }
  }

  useEffect(() => {
    if (initialScheduleId) {
      setSelectedScheduleId(initialScheduleId)
    }
  }, [initialScheduleId])

  useEffect(() => {
    if (!initialScheduleId && schedules.length && !selectedScheduleId) {
      setSelectedScheduleId(schedules[0].id)
    }
  }, [schedules, selectedScheduleId, initialScheduleId])

  useEffect(() => {
    fetchCatalogOptions()
  }, [])

  useEffect(() => {
    if (!selectedScheduleId) {
      setScheduleDetail(null)
      setItems([])
      return
    }
    fetchScheduleDetail(selectedScheduleId)
    fetchItems(selectedScheduleId)
  }, [selectedScheduleId])

  const fetchCatalogOptions = async () => {
    try {
      const [metaRes, typeRes] = await Promise.all([fetch('/api/catalog/meta'), fetch('/api/catalog/product-types')])
      if (!metaRes.ok || !typeRes.ok) throw new Error('Failed to load catalog metadata')
      const meta = await metaRes.json()
      const typesData = await typeRes.json()
      setBrands((meta.brands || []).map((brand: any) => ({ id: brand.id, name: brand.name })))
      setCategories(
        (meta.categories || []).map(
          (category: any) =>
            ({
              id: category.id,
              name: category.name,
              parentId: category.parentId ?? null,
            }) as CategoryOption,
        ),
      )
      setProductTypes(
        (typesData.productTypes || []).map(
          (type: any) =>
            ({
              id: type.id,
              name: type.name,
              brandId: type.brandId,
              subcategoryId: type.subcategory?.id ?? type.subcategoryId,
              subcategoryName: type.subcategory?.name ?? type.name,
              categoryId: type.subcategory?.parent?.id ?? null,
              categoryName: type.subcategory?.parent?.name ?? undefined,
            }) as ProductTypeOption,
        ),
      )
    } catch (error) {
      console.error(error)
      toast({
        title: 'Gagal memuat referensi katalog',
        description: 'Dropdown brand atau tipe material tidak dapat ditampilkan.',
        variant: 'destructive',
      })
    }
  }

  const fetchScheduleDetail = async (id: string) => {
    setLoadingDetail(true)
    try {
      const response = await fetch(`/api/schedule/${id}`)
      if (!response.ok) throw new Error('Failed to fetch schedule detail')
      const data = await response.json()
      setScheduleDetail(data.schedule || null)
      setNameDraft(data.schedule?.name || '')
    } catch (error) {
      console.error(error)
      toast({
        title: 'Tidak dapat memuat detail project',
        description: 'Periksa koneksi Anda dan coba lagi.',
        variant: 'destructive',
      })
    } finally {
      setLoadingDetail(false)
    }
  }

  const fetchItems = async (id: string) => {
    setLoadingItems(true)
    try {
      const response = await fetch(`/api/schedule/items?scheduleId=${encodeURIComponent(id)}`)
      if (!response.ok) throw new Error('Failed to fetch schedule items')
      const data = await response.json()
      const fetched: ScheduleItem[] = data.items || []
      setItems(fetched)
      setNameDrafts({})
      fetched.forEach((item) => {
        loadProductsForRow(item.id, item.brandId, item.productTypeId)
      })
    } catch (error) {
      console.error(error)
      toast({
        title: 'Gagal memuat items',
        description: 'Tidak dapat mengambil daftar material terbaru.',
        variant: 'destructive',
      })
    } finally {
      setLoadingItems(false)
    }
  }

  const loadProductsForRow = useCallback(
    async (rowId: string, brandId?: string | null, productTypeId?: string | null) => {
      if (!brandId || !productTypeId) {
        setSkuOptions((prev) => ({ ...prev, [rowId]: [] }))
        setSkuLoadingState((prev) => {
          const next = { ...prev }
          delete next[rowId]
          return next
        })
        return
      }

      setSkuLoadingState((prev) => ({ ...prev, [rowId]: true }))
      try {
        const params = new URLSearchParams({ brandId, productTypeId })
        const response = await fetch(`/api/catalog/products?${params.toString()}`)
        if (!response.ok) throw new Error('Failed to fetch SKU list')
        const data = await response.json()
        setSkuOptions((prev) => ({ ...prev, [rowId]: data.products || [] }))
      } catch (error) {
        console.error(error)
        setSkuOptions((prev) => ({ ...prev, [rowId]: [] }))
      } finally {
        setSkuLoadingState((prev) => {
          const next = { ...prev }
          delete next[rowId]
          return next
        })
      }
    },
    [],
  )

  const handleRename = async () => {
    if (!selectedScheduleId || !nameDraft.trim()) return
    setSavingSchedule(true)
    try {
      const response = await fetch(`/api/schedule/${selectedScheduleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameDraft.trim() }),
      })
      if (!response.ok) throw new Error('Failed to update schedule')
      const data = await response.json()
      setScheduleDetail((prev) => (prev ? { ...prev, ...data.schedule } : data.schedule))
      toast({ title: 'Nama project diperbarui' })
      setIsEditingName(false)
      refreshSchedules()
    } catch (error) {
      console.error(error)
      toast({
        title: 'Gagal menyimpan nama project',
        description: 'Pastikan koneksi stabil dan coba ulang.',
        variant: 'destructive',
      })
    } finally {
      setSavingSchedule(false)
    }
  }

  const handleItemUpdate = useCallback(
    async (itemId: string, updates: Record<string, any>) => {
      if (!itemId) return
      setSavingItemId(itemId)
      try {
        const response = await fetch('/api/schedule/items', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemId, userId, updates }),
        })
        if (!response.ok) throw new Error('Failed to update schedule item')
        const data = await response.json()
        const updated = data.item as ScheduleItem
        setItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
        setNameDrafts((prev) => {
          if (!prev[itemId]) return prev
          const nextDrafts = { ...prev }
          delete nextDrafts[itemId]
          return nextDrafts
        })
        if (updated.brandId && updated.productTypeId) {
          loadProductsForRow(updated.id, updated.brandId, updated.productTypeId)
        } else {
          setSkuOptions((prev) => ({ ...prev, [updated.id]: [] }))
        }
      } catch (error) {
        console.error(error)
        toast({
          title: 'Gagal menyimpan perubahan',
          description: 'Pastikan semua pilihan valid.',
          variant: 'destructive',
        })
      } finally {
        setSavingItemId(null)
      }
    },
    [loadProductsForRow, toast, userId],
  )

  const handleSkuChange = (itemId: string, productId: string) => {
    const options = skuOptions[itemId] || []
    const selected = options.find((option) => option.id === productId)
    if (!selected) return
    handleItemUpdate(itemId, {
      productId: selected.id,
      productName: selected.name,
      sku: selected.sku,
      brandId: selected.brandId,
      productTypeId: selected.productTypeId,
    })
  }

  const handleAddMaterial = async () => {
    if (!selectedScheduleId) {
      toast({
        title: 'Pilih project dahulu',
        description: 'Buat atau pilih schedule sebelum menambahkan material.',
        variant: 'destructive',
      })
      return
    }
    setAddingMaterial(true)
    try {
      const response = await fetch('/api/schedule/items/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduleId: selectedScheduleId, userId }),
      })
      if (!response.ok) throw new Error('Failed to add material')
      const data = await response.json()
      const newItem = data.item as ScheduleItem
      setItems((prev) => [newItem, ...prev])
      setScheduleDetail((prev) => (prev ? { ...prev, itemsCount: prev.itemsCount + 1 } : prev))
      toast({ title: 'Baris material baru ditambahkan' })
    } catch (error) {
      console.error(error)
      toast({
        title: 'Gagal menambah baris',
        description: 'Tidak dapat membuat kode NEW-00X baru.',
        variant: 'destructive',
      })
    } finally {
      setAddingMaterial(false)
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    if (!itemId) return
    try {
      const response = await fetch(`/api/schedule/items?itemId=${encodeURIComponent(itemId)}&userId=${encodeURIComponent(userId)}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete item')
      setItems((prev) => prev.filter((item) => item.id !== itemId))
      setScheduleDetail((prev) => (prev ? { ...prev, itemsCount: Math.max(prev.itemsCount - 1, 0) } : prev))
      toast({ title: 'Baris dihapus' })
    } catch (error) {
      console.error(error)
      toast({
        title: 'Tidak dapat menghapus baris',
        description: 'Coba muat ulang halaman dan ulangi.',
        variant: 'destructive',
      })
    }
  }

  const currentRowForProduct = useMemo(
    () => items.find((item) => item.id === manualProductRowId) || null,
    [items, manualProductRowId],
  )

  const scheduleSelectValue = selectedScheduleId || undefined

  const tableHeaderDescription = designerMode
    ? 'Designer wajib mengisi nama material, kategori, tipe, brand, dan SKU sebelum dikurasi admin.'
    : 'Admin dapat memperbarui brand, tipe, SKU, serta mengakses detail produk untuk kurasi lanjutan.'

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Active Project</p>
              {isEditingName ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    value={nameDraft}
                    onChange={(event) => setNameDraft(event.target.value)}
                    className="w-full max-w-sm"
                    autoFocus
                  />
                  <Button size="sm" onClick={handleRename} disabled={savingSchedule || !nameDraft.trim()}>
                    {savingSchedule ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Simpan'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setIsEditingName(false)
                      setNameDraft(scheduleDetail?.name || '')
                    }}
                  >
                    Batal
                  </Button>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-semibold">
                    {scheduleDetail?.name || (schedules.length ? 'Pilih project schedule' : 'Belum ada schedule')}
                  </h2>
                  {scheduleDetail && (
                    <Button variant="ghost" size="icon" onClick={() => setIsEditingName(true)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
              {scheduleDetail?.description && (
                <p className="text-sm text-muted-foreground">{scheduleDetail.description}</p>
              )}
              {loadingDetail && <p className="text-xs text-muted-foreground">Memuat detail project…</p>}
              {scheduleDetail && (
                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline">{scheduleDetail.itemsCount} items</Badge>
                  <span>Updated {new Date(scheduleDetail.updatedAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={scheduleSelectValue} onValueChange={(value) => setSelectedScheduleId(value)}>
              <SelectTrigger className="min-w-[220px]">
                <SelectValue placeholder="Pilih schedule" />
              </SelectTrigger>
              <SelectContent>
                {schedules.map((schedule) => (
                  <SelectItem key={schedule.id} value={schedule.id}>
                    {schedule.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={refreshSchedules} disabled={isScheduleLoading}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button size="sm" onClick={() => handleCreateDialogChange(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
            <Button variant="outline" size="sm" onClick={() => setDesignerMode((prev) => !prev)}>
              {designerMode ? 'Designer Mode' : 'Admin Mode'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {!schedules.length && (
        <Card>
          <CardContent className="flex flex-col gap-3 p-6 text-sm text-muted-foreground">
            <p>Belum ada project schedule. Buat project baru untuk mulai menyusun material.</p>
            <Button size="sm" className="w-fit" onClick={() => handleCreateDialogChange(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Buat Project Schedule
            </Button>
          </CardContent>
        </Card>
      )}

      {selectedScheduleId && (
        <Card>
          <CardHeader className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle>Schedule Items</CardTitle>
              <p className="text-sm text-muted-foreground">{tableHeaderDescription}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => selectedScheduleId && fetchItems(selectedScheduleId)}
                disabled={loadingItems || !selectedScheduleId}
              >
                {loadingItems ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh Items'}
              </Button>
              <Button size="sm" onClick={handleAddMaterial} disabled={addingMaterial || !selectedScheduleId}>
                {addingMaterial ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menambahkan…
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Material
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 overflow-x-auto">
            {loadingItems ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Memuat items…
              </div>
            ) : items.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada material di schedule ini.</p>
            ) : (
              <TooltipProvider>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kode</TableHead>
                      <TableHead>Nama Material</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Material Type</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>SKU / Product</TableHead>
                      <TableHead className="w-[160px]">Notes</TableHead>
                      <TableHead className="w-[220px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => {
                      const code = (item.attributes as any)?.code || item.productName || '—'
                      const skuLoading = skuLoadingState[item.id]
                      const rowOptions = skuOptions[item.id] || []
                      const canCreateLinkedProduct = Boolean(item.brandId && item.productTypeId)
                      const isSaving = savingItemId === item.id
                      const typeInfo = item.productTypeId ? productTypeLookup.get(item.productTypeId) : undefined
                      const attributeCategoryId = (item.attributes as any)?.categoryId as string | undefined
                      const attributeCategoryName = (item.attributes as any)?.categoryName as string | undefined
                      const currentCategoryId = attributeCategoryId || typeInfo?.categoryId || ''
                      const categoryLabel = attributeCategoryName || typeInfo?.categoryName
                      const currentNameValue = nameDrafts[item.id] ?? item.productName ?? ''
                      const filteredProductTypes =
                        currentCategoryId && productTypes.some((type) => type.categoryId === currentCategoryId)
                          ? productTypes.filter((type) => type.categoryId === currentCategoryId)
                          : productTypes
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-mono text-sm">{code}</TableCell>
                          <TableCell>
                            <Input
                              value={currentNameValue}
                              onChange={(event) =>
                                setNameDrafts((prev) => ({ ...prev, [item.id]: event.target.value }))
                              }
                              onBlur={() => {
                                const trimmed = currentNameValue.trim()
                                if (!trimmed || trimmed === item.productName) {
                                  if (!trimmed && nameDrafts[item.id]) {
                                    setNameDrafts((prev) => {
                                      const nextDrafts = { ...prev }
                                      delete nextDrafts[item.id]
                                      return nextDrafts
                                    })
                                  }
                                  return
                                }
                                handleItemUpdate(item.id, { productName: trimmed })
                              }}
                              placeholder="Nama material"
                              disabled={isSaving}
                            />
                          </TableCell>
                          <TableCell>
                            <Select
                              value={currentCategoryId || '__none__'}
                              onValueChange={(value) => {
                                if (value === '__none__') return
                                const selectedCategory = categories.find((category) => category.id === value)
                                handleItemUpdate(item.id, {
                                  attributes: {
                                    categoryId: selectedCategory?.id,
                                    categoryName: selectedCategory?.name,
                                  },
                                })
                              }}
                              disabled={!topLevelCategories.length || isSaving}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih kategori" />
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
                            <p className="mt-1 text-xs text-muted-foreground">
                              {categoryLabel ? `Auto: ${categoryLabel}` : 'Isi kategori utama proyek'}
                            </p>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={item.productTypeId || '__none__'}
                              onValueChange={(value) => {
                                if (value === '__none__') return
                                const selectedType = productTypes.find((type) => type.id === value)
                                const updates: Record<string, any> = { productTypeId: value }
                                if (selectedType?.categoryId) {
                                  updates.attributes = {
                                    categoryId: selectedType.categoryId,
                                    categoryName: selectedType.categoryName,
                                    subcategoryId: selectedType.subcategoryId,
                                    subcategoryName: selectedType.subcategoryName,
                                  }
                                }
                                handleItemUpdate(item.id, updates)
                              }}
                              disabled={isSaving}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih tipe" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none__" disabled>
                                  Pilih tipe
                                </SelectItem>
                                {filteredProductTypes.map((type) => (
                                  <SelectItem key={type.id} value={type.id}>
                                    {type.name}
                                    {type.categoryName ? ` · ${type.categoryName}` : ''}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={item.brandId || '__none__'}
                              onValueChange={(value) => {
                                if (value === '__none__') return
                                handleItemUpdate(item.id, { brandId: value })
                              }}
                              disabled={isSaving}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih brand" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none__" disabled>
                                  Pilih brand
                                </SelectItem>
                                {brands.map((brand) => (
                                  <SelectItem key={brand.id} value={brand.id}>
                                    {brand.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={item.productId || '__none__'}
                              onValueChange={(value) => {
                                if (value === '__none__') return
                                handleSkuChange(item.id, value)
                              }}
                              disabled={!rowOptions.length || isSaving}
                            >
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={
                                    skuLoading ? 'Memuat SKU…' : !rowOptions.length ? 'Pilih brand dan tipe' : 'Pilih SKU'
                                  }
                                />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none__" disabled>
                                  Pilih SKU
                                </SelectItem>
                                {rowOptions.map((option) => (
                                  <SelectItem key={option.id} value={option.id}>
                                    {option.sku} · {option.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="block max-w-[180px] truncate text-sm text-muted-foreground">
                                  {item.notes || '—'}
                                </span>
                              </TooltipTrigger>
                              {item.notes && (
                                <TooltipContent className="max-w-xs text-sm">{item.notes}</TooltipContent>
                              )}
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={!item.productId || isSaving}
                      onClick={() => item.productId && router.push(`/product/${item.productId}`)}
                    >
                      Edit Product
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={!canCreateLinkedProduct || isSaving}
                      onClick={() => canCreateLinkedProduct && setManualProductRowId(item.id)}
                      title={
                        canCreateLinkedProduct
                          ? 'Buat SKU baru dari referensi baris ini'
                          : 'Pilih brand dan material type terlebih dahulu'
                      }
                    >
                      New Product
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteItem(item.id)} disabled={isSaving}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </TooltipProvider>
            )}
          </CardContent>
        </Card>
      )}

        {currentRowForProduct && (
          <AddProductDialog
            open
            onOpenChange={(open) => {
              if (!open) setManualProductRowId(null)
            }}
            brands={brands}
            productTypes={productTypes}
            defaultValues={{
              brandId: currentRowForProduct.brandId || undefined,
              productTypeId: currentRowForProduct.productTypeId || undefined,
            }}
            title="Create New Product"
            description="Tambah produk baru lalu kaitkan langsung ke baris schedule ini."
            onCreated={(product) => {
              setManualProductRowId(null)
              handleItemUpdate(currentRowForProduct.id, {
                productId: product.id,
                productName: product.name,
                sku: product.sku,
                brandId: product.brandId,
                productTypeId: product.productTypeId,
              })
            }}
          />
        )}
      </div>

      <Dialog open={createDialogOpen} onOpenChange={handleCreateDialogChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Buat Project Schedule</DialogTitle>
            <DialogDescription>Masukkan nama project dan deskripsi opsional untuk mulai menyusun material.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleCreateSchedule}>
            <div className="space-y-2">
              <Label htmlFor="schedule-name">Nama Project</Label>
              <Input
                id="schedule-name"
                value={newScheduleName}
                onChange={(event) => setNewScheduleName(event.target.value)}
                placeholder="Contoh: Renovasi Lobby HQ"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="schedule-description">Deskripsi</Label>
              <Textarea
                id="schedule-description"
                value={newScheduleDescription}
                onChange={(event) => setNewScheduleDescription(event.target.value)}
                placeholder="Catatan singkat proyek (opsional)"
                rows={4}
              />
            </div>
            <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="ghost" onClick={() => handleCreateDialogChange(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={creatingSchedule || !newScheduleName.trim()}>
                {creatingSchedule && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Buat Schedule
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
