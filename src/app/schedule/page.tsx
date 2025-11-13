'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Edit, Eye, FileText, Plus, RefreshCw, Table, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table as UITable, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { useSchedules } from '@/hooks/use-schedules'

type ScheduleItem = {
  id: string
  scheduleId: string
  productId: string
  variantId?: string | null
  productName: string
  brandName: string
  sku: string
  price: number
  attributes: Record<string, unknown>
  quantity: number
  unitOfMeasure: string
  area?: string | null
  notes?: string | null
  createdAt: string
  updatedAt: string
}

const USER_ID = 'anonymous'

export default function SchedulePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { schedules, isLoading: loadingSchedules, refresh: refreshSchedules, setSchedules } = useSchedules(USER_ID)
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null)
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([])
  const [loadingItems, setLoadingItems] = useState(false)
  const [showNewScheduleDialog, setShowNewScheduleDialog] = useState(false)
  const [newScheduleName, setNewScheduleName] = useState('')
  const [newScheduleDescription, setNewScheduleDescription] = useState('')

  const selectedSchedule = useMemo(
    () => schedules.find((schedule) => schedule.id === selectedScheduleId) ?? null,
    [schedules, selectedScheduleId],
  )

  useEffect(() => {
    if (!schedules.length) {
      setSelectedScheduleId(null)
      setScheduleItems([])
      return
    }
    setSelectedScheduleId((prev) => (prev && schedules.some((schedule) => schedule.id === prev) ? prev : schedules[0].id))
  }, [schedules])

  useEffect(() => {
    if (selectedScheduleId) {
      fetchScheduleItems(selectedScheduleId)
    } else {
      setScheduleItems([])
    }
  }, [selectedScheduleId])

  const fetchScheduleItems = async (scheduleId: string) => {
    setLoadingItems(true)
    try {
      const response = await fetch(`/api/schedule/items?scheduleId=${scheduleId}&userId=${USER_ID}`)
      if (!response.ok) throw new Error('Failed to load items')
      const data = await response.json()
      setScheduleItems(data.items || [])
    } catch (error) {
      console.error(error)
      setScheduleItems([])
      toast({
        title: 'Gagal memuat items',
        description: 'Periksa koneksi atau coba refresh halaman.',
        variant: 'destructive',
      })
    } finally {
      setLoadingItems(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(price)
  }

  const summary = useMemo(() => {
    const totalAmount = scheduleItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const totalQuantity = scheduleItems.reduce((sum, item) => sum + item.quantity, 0)
    return { totalAmount, totalQuantity }
  }, [scheduleItems])

  const exportToCSV = () => {
    if (!selectedSchedule) return
    const headers = ['Product Name', 'Brand', 'SKU', 'Price', 'Quantity', 'Total', 'Area', 'UoM', 'Notes']
    const rows = scheduleItems.map((item) => [
      item.productName,
      item.brandName,
      item.sku,
      item.price.toString(),
      item.quantity.toString(),
      (item.price * item.quantity).toString(),
      item.area || '',
      item.unitOfMeasure,
      item.notes || '',
    ])

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${selectedSchedule.name.replace(/\s+/g, '_')}_schedule.csv`
    anchor.click()
    window.URL.revokeObjectURL(url)
  }

  const exportToExcel = () => {
    if (!selectedSchedule) return
    const rows = scheduleItems
      .map(
        (item) => `
        <tr>
          <td>${item.productName}</td>
          <td>${item.brandName}</td>
          <td>${item.sku}</td>
          <td>${item.price}</td>
          <td>${item.quantity}</td>
          <td>${item.price * item.quantity}</td>
          <td>${item.area || ''}</td>
          <td>${item.unitOfMeasure}</td>
          <td>${item.notes || ''}</td>
        </tr>`,
      )
      .join('')

    const table = `
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Brand</th>
            <th>SKU</th>
            <th>Unit Price</th>
            <th>Quantity</th>
            <th>Total</th>
            <th>Area</th>
            <th>UoM</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `

    const blob = new Blob([table], { type: 'application/vnd.ms-excel' })
    const url = window.URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${selectedSchedule.name.replace(/\s+/g, '_')}_schedule.xls`
    anchor.click()
    window.URL.revokeObjectURL(url)
  }

  const createNewSchedule = async () => {
    if (!newScheduleName.trim()) return
    try {
      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: USER_ID,
          name: newScheduleName,
          description: newScheduleDescription,
        }),
      })
      if (!response.ok) throw new Error('Failed to create schedule')
      const data = await response.json()
      setSchedules((prev) => [data.schedule, ...prev])
      setSelectedScheduleId(data.schedule.id)
      setNewScheduleName('')
      setNewScheduleDescription('')
      setShowNewScheduleDialog(false)
      toast({
        title: 'Schedule created',
        description: `"${data.schedule.name}" siap menerima item.`,
      })
    } catch (error) {
      console.error(error)
      toast({
        title: 'Gagal membuat schedule',
        description: 'Periksa nama project dan coba lagi.',
        variant: 'destructive',
      })
    }
  }

  const deleteScheduleItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/schedule/items?itemId=${itemId}&userId=${USER_ID}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete item')
      setScheduleItems((prev) => prev.filter((item) => item.id !== itemId))
      const deletedItem = scheduleItems.find((item) => item.id === itemId)
      setSchedules((prev) =>
        prev.map((schedule) =>
          schedule.id === selectedScheduleId && deletedItem
            ? {
                ...schedule,
                itemsCount: Math.max(0, schedule.itemsCount - 1),
                totalAmount: Math.max(0, schedule.totalAmount - deletedItem.price * deletedItem.quantity),
              }
            : schedule,
        ),
      )
      toast({
        title: 'Item dihapus',
        description: 'Baris schedule berhasil dihapus.',
      })
    } catch (error) {
      console.error(error)
      toast({
        title: 'Gagal menghapus',
        description: 'Terjadi kesalahan saat menghapus item.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
              <Eye className="w-4 h-4 mr-2" />
              Back to Search
            </Button>
            <h1 className="text-xl font-semibold">Project Schedules</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={refreshSchedules} disabled={loadingSchedules}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Dialog open={showNewScheduleDialog} onOpenChange={setShowNewScheduleDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New Schedule
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Schedule</DialogTitle>
                <DialogDescription>Organize materials, lighting, or furniture by project.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input value={newScheduleName} onChange={(event) => setNewScheduleName(event.target.value)} />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    value={newScheduleDescription}
                    onChange={(event) => setNewScheduleDescription(event.target.value)}
                  />
                </div>
                <Button onClick={createNewSchedule} disabled={!newScheduleName.trim()}>
                  Create
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="items" disabled={!selectedScheduleId}>
              Schedule Items
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {loadingSchedules ? (
              <Card>
                <CardContent className="p-6 text-sm text-muted-foreground">Loading schedules...</CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {schedules.map((schedule) => (
                  <Card
                    key={schedule.id}
                    className={`cursor-pointer transition ${selectedScheduleId === schedule.id ? 'border-primary' : ''}`}
                    onClick={() => setSelectedScheduleId(schedule.id)}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {schedule.name}
                        <Badge variant="outline">{schedule.itemsCount} items</Badge>
                      </CardTitle>
                      <CardDescription>{schedule.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Created on {new Date(schedule.createdAt).toLocaleDateString('id-ID')}
                      </p>
                      <p className="text-lg font-semibold">{formatPrice(schedule.totalAmount)}</p>
                    </CardContent>
                  </Card>
                ))}
                {!schedules.length && !loadingSchedules && (
                  <Card>
                    <CardContent className="p-6 text-sm text-muted-foreground">
                      No schedules yet. Create one to start building your project.
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="items" className="space-y-6">
            {loadingItems ? (
              <Card>
                <CardContent className="p-6 text-sm text-muted-foreground">Loading schedule items...</CardContent>
              </Card>
            ) : selectedSchedule ? (
              <Card>
                <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>{selectedSchedule.name}</CardTitle>
                    <CardDescription>{selectedSchedule.description}</CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={exportToCSV}>
                      <Table className="w-4 h-4 mr-2" />
                      Export CSV
                    </Button>
                    <Button variant="outline" size="sm" onClick={exportToExcel}>
                      <FileText className="w-4 h-4 mr-2" />
                      Export Excel
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedSchedule && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <Card className="bg-muted/50">
                        <CardHeader>
                          <CardTitle className="text-sm text-muted-foreground">Project total</CardTitle>
                          <CardDescription className="text-2xl font-semibold text-foreground">
                            {formatPrice(summary.totalAmount)}
                          </CardDescription>
                        </CardHeader>
                      </Card>
                      <Card className="bg-muted/50">
                        <CardHeader>
                          <CardTitle className="text-sm text-muted-foreground">Total quantity</CardTitle>
                          <CardDescription className="text-2xl font-semibold text-foreground">
                            {summary.totalQuantity}
                          </CardDescription>
                        </CardHeader>
                      </Card>
                      <Card className="bg-muted/50">
                        <CardHeader>
                          <CardTitle className="text-sm text-muted-foreground">Items captured</CardTitle>
                          <CardDescription className="text-2xl font-semibold text-foreground">
                            {scheduleItems.length}
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    </div>
                  )}
                  <div className="overflow-x-auto">
                    <UITable>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Brand</TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead>Attributes</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {scheduleItems.length ? (
                          scheduleItems.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{item.productName}</p>
                                  <p className="text-xs text-muted-foreground">{item.area}</p>
                                </div>
                              </TableCell>
                              <TableCell>{item.brandName}</TableCell>
                              <TableCell>{item.sku}</TableCell>
                              <TableCell>
                                <div className="text-xs text-muted-foreground space-y-1">
                                  {Object.entries(item.attributes || {}).map(([key, value]) => (
                                    <div key={key}>
                                      {key}: <span className="text-foreground">{String(value)}</span>
                                    </div>
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell>
                                {item.quantity} {item.unitOfMeasure}
                              </TableCell>
                              <TableCell>{formatPrice(item.price)}</TableCell>
                              <TableCell>{formatPrice(item.price * item.quantity)}</TableCell>
                              <TableCell className="text-right space-x-2">
                                <Button variant="ghost" size="icon">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => deleteScheduleItem(item.id)}>
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center text-sm text-muted-foreground">
                              No items yet. Add products from the search or product details page.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </UITable>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6 text-sm text-muted-foreground">
                  Select a schedule from the overview tab to see its items.
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
