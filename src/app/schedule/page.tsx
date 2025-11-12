'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Download, Trash2, Edit, Eye, FileText, Table, Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

// Mock schedule data
const mockSchedules = [
  {
    id: '1',
    name: 'Office Renovation Project',
    description: 'Complete office renovation with new lighting and furniture',
    createdAt: '2024-01-15',
    items: [
      {
        id: '1',
        productName: 'Downlight LED 3W 3000K',
        brandName: 'Philips',
        sku: 'PH-DL-3W-30K',
        price: 150000,
        quantity: 25,
        unitOfMeasure: 'pcs',
        area: 'Main Office',
        notes: 'Install in grid pattern',
        attributes: { wattage: '3W', cri: '90', cct: '3000K' }
      },
      {
        id: '2',
        productName: 'Ergonomic Office Chair',
        brandName: 'Herman Miller',
        sku: 'HM-CHAIR-ERG-01',
        price: 8500000,
        quantity: 10,
        unitOfMeasure: 'pcs',
        area: 'Work Area',
        notes: 'With lumbar support',
        attributes: { material: 'Mesh', color: 'Black' }
      }
    ]
  },
  {
    id: '2',
    name: 'Residential Lighting',
    description: 'Lighting design for modern residential project',
    createdAt: '2024-01-20',
    items: [
      {
        id: '3',
        productName: 'HPL Taco Walnut',
        brandName: 'Taco',
        sku: 'TC-HPL-WNT-001',
        price: 280000,
        quantity: 15,
        unitOfMeasure: 'sheets',
        area: 'Kitchen Cabinets',
        notes: 'Walnut finish for all cabinets',
        attributes: { thickness: '1.2mm', finish: 'Textured' }
      }
    ]
  }
]

export default function SchedulePage() {
  const router = useRouter()
  const [schedules, setSchedules] = useState(mockSchedules)
  const [selectedSchedule, setSelectedSchedule] = useState(mockSchedules[0])
  const [scheduleItems, setScheduleItems] = useState([])
  const [showNewScheduleDialog, setShowNewScheduleDialog] = useState(false)
  const [newScheduleName, setNewScheduleName] = useState('')
  const [newScheduleDescription, setNewScheduleDescription] = useState('')

  // Fetch schedule items on component mount
  useEffect(() => {
    fetchScheduleItems()
  }, [])

  const fetchScheduleItems = async () => {
    try {
      const response = await fetch('/api/schedule/items?scheduleId=default')
      if (response.ok) {
        const data = await response.json()
        setScheduleItems(data.items || [])
      }
    } catch (error) {
      console.error('Error fetching schedule items:', error)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price)
  }

  const calculateTotal = (items: any[]) => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const createNewSchedule = () => {
    if (!newScheduleName.trim()) return

    const newSchedule = {
      id: Date.now().toString(),
      name: newScheduleName,
      description: newScheduleDescription,
      createdAt: new Date().toISOString().split('T')[0],
      items: []
    }

    setSchedules([...schedules, newSchedule])
    setSelectedSchedule(newSchedule)
    setNewScheduleName('')
    setNewScheduleDescription('')
    setShowNewScheduleDialog(false)
  }

  const deleteScheduleItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/schedule/items?itemId=${itemId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        const updatedItems = scheduleItems.filter(item => item.id !== itemId)
        setScheduleItems(updatedItems)
        
        // Update the selected schedule
        const updatedSchedule = {
          ...selectedSchedule,
          items: updatedItems
        }
        setSelectedSchedule(updatedSchedule)
        setSchedules(schedules.map(s => s.id === updatedSchedule.id ? updatedSchedule : s))
      }
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('Failed to delete item')
    }
  }

  const exportToCSV = () => {
    const headers = ['Product Name', 'Brand', 'SKU', 'Price', 'Quantity', 'Total', 'Area', 'UoM', 'Notes']
    const rows = scheduleItems.map(item => [
      item.productName,
      item.brandName,
      item.sku,
      item.price.toString(),
      item.quantity.toString(),
      (item.price * item.quantity).toString(),
      item.area || '',
      item.unitOfMeasure,
      item.notes || ''
    ])

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedSchedule.name.replace(/\s+/g, '_')}_schedule.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const exportToJSON = () => {
    const exportData = {
      schedule: {
        name: selectedSchedule.name,
        description: selectedSchedule.description,
        createdAt: selectedSchedule.createdAt,
        totalAmount: calculateTotal(scheduleItems)
      },
      items: scheduleItems.map(item => ({
        ...item,
        total: item.price * item.quantity
      }))
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedSchedule.name.replace(/\s+/g, '_')}_schedule.json`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const generateMaterialSchedule = () => {
    const materialItems = scheduleItems.filter(item => 
      item.attributes.thickness || item.attributes.finish || item.attributes.material
    )

    return {
      title: 'Material Schedule',
      items: materialItems
    }
  }

  const generateLightingSchedule = () => {
    const lightingItems = scheduleItems.filter(item => 
      item.attributes.wattage || item.attributes.cct || item.attributes.cri
    )

    return {
      title: 'Lighting Schedule',
      items: lightingItems
    }
  }

  const generateFurnitureSchedule = () => {
    const furnitureItems = scheduleItems.filter(item => 
      item.attributes.material === 'Mesh' || item.attributes.color || item.attributes.adjustableHeight
    )

    return {
      title: 'Furniture Schedule',
      items: furnitureItems
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
                <Table className="w-4 h-4 mr-2" />
                Back to Search
              </Button>
              <Table className="w-5 h-5 text-muted-foreground" />
              <h1 className="text-xl font-semibold">Project Schedules</h1>
            </div>
            <div className="flex items-center gap-2">
              <Dialog open={showNewScheduleDialog} onOpenChange={setShowNewScheduleDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New Schedule
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Schedule</DialogTitle>
                    <DialogDescription>
                      Create a new project schedule to organize your products.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="schedule-name">Schedule Name</Label>
                      <Input
                        id="schedule-name"
                        placeholder="e.g., Office Renovation Project"
                        value={newScheduleName}
                        onChange={(e) => setNewScheduleName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="schedule-description">Description (Optional)</Label>
                      <Input
                        id="schedule-description"
                        placeholder="Brief description of the project"
                        value={newScheduleDescription}
                        onChange={(e) => setNewScheduleDescription(e.target.value)}
                      />
                    </div>
                    <Button onClick={createNewSchedule} className="w-full">
                      Create Schedule
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Schedule List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">My Schedules</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {schedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedSchedule.id === schedule.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedSchedule(schedule)}
                  >
                    <h3 className="font-medium">{schedule.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {schedule.description}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {schedule.items.length} items
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {schedule.createdAt}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Schedule Details */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{selectedSchedule.name}</CardTitle>
                    <CardDescription>{selectedSchedule.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={exportToCSV}>
                      <Download className="w-4 h-4 mr-2" />
                      CSV
                    </Button>
                    <Button variant="outline" size="sm" onClick={exportToJSON}>
                      <FileText className="w-4 h-4 mr-2" />
                      JSON
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {scheduleItems.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Table className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No Items Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start adding products to your schedule from the search page.
                    </p>
                    <Button onClick={() => router.push('/')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Products
                    </Button>
                  </div>
                ) : (
                  <div>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                              <p className="text-2xl font-bold">{scheduleItems.length}</p>
                            </div>
                            <Calculator className="w-8 h-8 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Total Quantity</p>
                              <p className="text-2xl font-bold">
                                {scheduleItems.reduce((sum, item) => sum + item.quantity, 0)}
                              </p>
                            </div>
                            <Calculator className="w-8 h-8 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                              <p className="text-2xl font-bold text-primary">
                                {formatPrice(calculateTotal(scheduleItems))}
                              </p>
                            </div>
                            <Calculator className="w-8 h-8 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Items Table */}
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Brand</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Qty</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Area</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {scheduleItems.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">{item.productName}</TableCell>
                              <TableCell>{item.brandName}</TableCell>
                              <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                              <TableCell>{formatPrice(item.price)}</TableCell>
                              <TableCell>{item.quantity} {item.unitOfMeasure}</TableCell>
                              <TableCell className="font-medium">
                                {formatPrice(item.price * item.quantity)}
                              </TableCell>
                              <TableCell>{item.area || '-'}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Button variant="ghost" size="sm" onClick={() => router.push(`/product/${item.productId}`)}>
                                    <Eye className="w-3 h-3" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => deleteScheduleItem(item.id)}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Specialized Schedules */}
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-4">Generate Specialized Schedules</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button 
                          variant="outline" 
                          className="h-auto p-4 flex flex-col items-start"
                          onClick={() => {
                            const schedule = generateMaterialSchedule()
                            alert(`Material Schedule: ${schedule.items.length} items`)
                          }}
                        >
                          <FileText className="w-6 h-6 mb-2" />
                          <span className="font-medium">Material Schedule</span>
                          <span className="text-sm text-muted-foreground">
                            {generateMaterialSchedule().items.length} items
                          </span>
                        </Button>
                        <Button 
                          variant="outline" 
                          className="h-auto p-4 flex flex-col items-start"
                          onClick={() => {
                            const schedule = generateLightingSchedule()
                            alert(`Lighting Schedule: ${schedule.items.length} items`)
                          }}
                        >
                          <FileText className="w-6 h-6 mb-2" />
                          <span className="font-medium">Lighting Schedule</span>
                          <span className="text-sm text-muted-foreground">
                            {generateLightingSchedule().items.length} items
                          </span>
                        </Button>
                        <Button 
                          variant="outline" 
                          className="h-auto p-4 flex flex-col items-start"
                          onClick={() => {
                            const schedule = generateFurnitureSchedule()
                            alert(`Furniture Schedule: ${schedule.items.length} items`)
                          }}
                        >
                          <FileText className="w-6 h-6 mb-2" />
                          <span className="font-medium">Furniture Schedule</span>
                          <span className="text-sm text-muted-foreground">
                            {generateFurnitureSchedule().items.length} items
                          </span>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}