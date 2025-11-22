"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Drawer, DrawerContent, DrawerTrigger, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, ArrowLeft, Plus, Search, Swap, Trash2 } from "lucide-react";
import { useProject } from "@/hooks/useProjects";
import {
  useCreateScheduleItem,
  useDeleteScheduleItem,
  useProjectItems,
  useSwapCodes,
  useUpdateScheduleItem,
} from "@/hooks/useProjectItems";
import { useSearchProducts } from "@/hooks/useProducts";
import { useBrands } from "@/hooks/useBrands";
import { useSubcategories } from "@/hooks/useSubcategories";
import { productService } from "@/services/productService";
import { toast } from "sonner";

function AttributeField({
  field,
  value,
  onChange,
}: {
  field: any
  value: any
  onChange: (val: any) => void
}) {
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

function AddProductDrawer({ projectId, onAdded }: { projectId: string; onAdded: () => void }) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [quickCreate, setQuickCreate] = useState({
    name: '',
    skuOrType: '',
    brandId: '',
    subcategoryId: '',
    attributes: {} as Record<string, any>,
  })

  const { data: products } = useSearchProducts(searchTerm ? { search: searchTerm } : undefined)
  const { data: brands } = useBrands()
  const { data: subcategories } = useSubcategories()
  const createItem = useCreateScheduleItem(projectId)

  const selectedTemplate = useMemo(() => {
    return subcategories?.find((s) => s.id === quickCreate.subcategoryId)?.defaultAttributesTemplate || []
  }, [quickCreate.subcategoryId, subcategories])

  const handleAddFromCatalog = async (productId: string) => {
    try {
      await createItem.mutateAsync({ productId })
      toast.success('Added to schedule')
      onAdded()
      setOpen(false)
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to add product')
    }
  }

  const handleQuickCreate = async () => {
    if (!quickCreate.name || !quickCreate.skuOrType || !quickCreate.brandId || !quickCreate.subcategoryId) {
      toast.error('Please complete all fields')
      return
    }

    const attributesData = Array.isArray(selectedTemplate)
      ? Object.fromEntries(
          selectedTemplate.map((field: any) => [field.name, quickCreate.attributes[field.name] ?? null]),
        )
      : null

    try {
      const product = await productService.create({
        name: quickCreate.name,
        skuOrType: quickCreate.skuOrType,
        brandId: quickCreate.brandId,
        subcategoryId: quickCreate.subcategoryId,
        attributesData: attributesData || undefined,
      })
      await createItem.mutateAsync({ productId: product.id })
      toast.success('Product created and added')
      onAdded()
      setOpen(false)
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to create product')
    }
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </DrawerTrigger>
      <DrawerContent className="p-6 space-y-4">
        <DrawerHeader>
          <DrawerTitle>Add Product</DrawerTitle>
        </DrawerHeader>
        <Tabs defaultValue="catalog">
          <TabsList>
            <TabsTrigger value="catalog">Search Catalog</TabsTrigger>
            <TabsTrigger value="quick">Quick Create</TabsTrigger>
          </TabsList>
          <TabsContent value="catalog" className="space-y-3">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, SKU, or brand"
              />
            </div>
            <div className="space-y-2 max-h-[320px] overflow-y-auto">
              {(products || []).map((product) => (
                <div
                  key={product.id}
                  className="p-3 border rounded-lg flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {product.brand.name} · {product.skuOrType}
                    </p>
                    <p className="text-xs text-muted-foreground">{product.subcategory.name}</p>
                  </div>
                  <Button size="sm" onClick={() => handleAddFromCatalog(product.id)}>
                    Add to Schedule
                  </Button>
                </div>
              ))}
              {(products || []).length === 0 && (
                <p className="text-sm text-muted-foreground">No products found.</p>
              )}
            </div>
          </TabsContent>
          <TabsContent value="quick" className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                placeholder="Product name"
                value={quickCreate.name}
                onChange={(e) => setQuickCreate((p) => ({ ...p, name: e.target.value }))}
              />
              <Input
                placeholder="SKU / Type"
                value={quickCreate.skuOrType}
                onChange={(e) => setQuickCreate((p) => ({ ...p, skuOrType: e.target.value }))}
              />
              <Select
                value={quickCreate.brandId}
                onValueChange={(value) => setQuickCreate((p) => ({ ...p, brandId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select brand" />
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
                value={quickCreate.subcategoryId}
                onValueChange={(value) => setQuickCreate((p) => ({ ...p, subcategoryId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subcategory" />
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
                <p className="text-sm font-medium">Attributes</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedTemplate.map((field: any) => (
                    <div key={field.name} className="space-y-1">
                      <p className="text-xs text-muted-foreground">{field.name}</p>
                      <AttributeField
                        field={field}
                        value={quickCreate.attributes[field.name] ?? ''}
                        onChange={(val) =>
                          setQuickCreate((p) => ({
                            ...p,
                            attributes: { ...p.attributes, [field.name]: val },
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-end">
              <Button onClick={handleQuickCreate}>Save & Add</Button>
            </div>
          </TabsContent>
        </Tabs>
      </DrawerContent>
    </Drawer>
  )
}

export default function ProjectSchedulePage({ params }: { params: { id: string } }) {
  const projectId = params.id
  const { data: project } = useProject(projectId)
  const { data: items, refetch } = useProjectItems(projectId)
  const updateItem = useUpdateScheduleItem(projectId)
  const deleteItem = useDeleteScheduleItem(projectId)
  const swapCodes = useSwapCodes(projectId)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())

  const toggleSelect = (id: string, checked: boolean) => {
    setSelectedItems((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const handleSwap = async () => {
    if (selectedItems.size !== 2) {
      toast.error('Select exactly two items to swap')
      return
    }
    const [itemIdA, itemIdB] = Array.from(selectedItems)
    await swapCodes.mutateAsync({ itemIdA, itemIdB })
    setSelectedItems(new Set())
    refetch()
  }

  const handleUpdateRow = async (itemId: string, field: 'quantity' | 'notes', value: any) => {
    await updateItem.mutateAsync({ itemId, data: { [field]: value } })
    refetch()
  }

  const handleDelete = async (itemId: string) => {
    await deleteItem.mutateAsync(itemId)
    setSelectedItems((prev) => {
      const next = new Set(prev)
      next.delete(itemId)
      return next
    })
    refetch()
  }

  return (
    <AppLayout>
      <div className="px-4 md:px-6 py-8 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/projects">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-semibold">{project?.name || 'Project'}</h2>
            <p className="text-sm text-muted-foreground">Project Schedule</p>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Schedule Items</CardTitle>
              <CardDescription>Manage material codes for this project</CardDescription>
            </div>
            <div className="flex gap-2 flex-wrap">
              <AddProductDrawer projectId={projectId} onAdded={refetch} />
              <Button variant="outline" size="sm" onClick={handleSwap} disabled={selectedItems.size !== 2}>
                <Swap className="w-4 h-4 mr-2" />
                Swap Code
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!items ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="w-4 h-4" /> Loading schedule...
              </div>
            ) : items.length === 0 ? (
              <p className="text-sm text-muted-foreground">No items yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead></TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU/Type</TableHead>
                      <TableHead>Subcategory</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedItems.has(item.id)}
                            onCheckedChange={(checked) => toggleSelect(item.id, !!checked)}
                          />
                        </TableCell>
                        <TableCell className="font-mono text-xs">{item.code}</TableCell>
                        <TableCell>{item.product.brand.name}</TableCell>
                        <TableCell>{item.product.name}</TableCell>
                        <TableCell>{item.product.skuOrType}</TableCell>
                        <TableCell>{item.product.subcategory.name}</TableCell>
                        <TableCell>
                          <Input
                            defaultValue={item.quantity ?? ''}
                            type="number"
                            onBlur={(e) => handleUpdateRow(item.id, 'quantity', e.target.value ? Number(e.target.value) : null)}
                          />
                        </TableCell>
                        <TableCell>
                          <Textarea
                            defaultValue={item.notes ?? ''}
                            rows={2}
                            onBlur={(e) => handleUpdateRow(item.id, 'notes', e.target.value || null)}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive gap-2"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
