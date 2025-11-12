'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Search, Plus, Download, Eye, Share2, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import Image from 'next/image'

// Mock product data
const mockProduct = {
  id: '1',
  name: 'Downlight LED 3W 3000K',
  nameEn: 'Downlight LED 3W 3000K',
  sku: 'PH-DL-3W-30K',
  description: 'High-quality LED downlight with warm white color temperature, perfect for residential and commercial lighting applications.',
  descriptionEn: 'High-quality LED downlight with warm white color temperature, perfect for residential and commercial lighting applications.',
  basePrice: 150000,
  images: [
    '/api/placeholder/400/400',
    '/api/placeholder/400/400',
    '/api/placeholder/400/400'
  ],
  datasheets: ['/api/datasheet.pdf'],
  cadFiles: ['/api/cad.dwg'],
  keywords: ['downlight', 'led', '3000k', 'warm-white'],
  viewCount: 245,
  usageCount: 89,
  productTypeName: 'Downlight',
  brandName: 'Philips',
  categoryName: 'Lighting',
  brand: {
    id: 'philips',
    name: 'Philips',
    description: 'Leading lighting technology company',
    website: 'https://www.philips.com',
    logo: '/api/placeholder/100/100'
  },
  variants: [
    {
      id: 'v1',
      name: 'Warm White 3000K',
      nameEn: 'Warm White 3000K',
      attributes: {
        wattage: '3W',
        cri: '90',
        cct: '3000K',
        beamAngle: '120°',
        voltage: '220-240V',
        ipRating: 'IP20',
        lifespan: '25,000 hours',
        dimmable: true
      },
      price: 150000,
      stock: 150
    },
    {
      id: 'v2',
      name: 'Cool White 4000K',
      nameEn: 'Cool White 4000K',
      attributes: {
        wattage: '3W',
        cri: '90',
        cct: '4000K',
        beamAngle: '120°',
        voltage: '220-240V',
        ipRating: 'IP20',
        lifespan: '25,000 hours',
        dimmable: true
      },
      price: 145000,
      stock: 200
    }
  ],
  relatedProducts: [
    {
      id: '2',
      name: 'Downlight LED 5W 3000K',
      brandName: 'Philips',
      price: 180000,
      image: '/api/placeholder/200/200'
    },
    {
      id: '3',
      name: 'Spotlight LED 3W 3000K',
      brandName: 'Philips',
      price: 165000,
      image: '/api/placeholder/200/200'
    }
  ]
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [selectedVariant, setSelectedVariant] = useState(mockProduct.variants[0])
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [scheduleData, setScheduleData] = useState({
    area: '',
    notes: ''
  })

  useEffect(() => {
    // Track product view
    trackActivity('VIEW_PRODUCT', mockProduct.id, selectedVariant.id)
  }, [])

  const trackActivity = async (type: string, productId?: string, variantId?: string) => {
    try {
      await fetch('/api/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'anonymous', // In real app, get from auth
          type,
          productId,
          variantId,
          searchQuery: ''
        })
      })
    } catch (error) {
      console.error('Error tracking activity:', error)
    }
  }

  const handleAddToSchedule = async () => {
    try {
      const response = await fetch('/api/schedule/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduleId: 'default',
          productId: mockProduct.id,
          variantId: selectedVariant.id,
          productName: mockProduct.name,
          brandName: mockProduct.brandName,
          sku: mockProduct.sku,
          price: selectedVariant.price,
          attributes: selectedVariant.attributes,
          quantity,
          unitOfMeasure: 'pcs',
          area: scheduleData.area,
          notes: scheduleData.notes
        })
      })

      if (response.ok) {
        alert('Product added to schedule!')
        trackActivity('ADD_TO_SCHEDULE', mockProduct.id, selectedVariant.id)
      } else {
        const error = await response.json()
        alert(`Failed to add to schedule: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error adding to schedule:', error)
      alert('Failed to add to schedule. Please try again.')
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-muted-foreground" />
                <span className="font-semibold">Product Details</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Heart className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={mockProduct.images[selectedImage]}
                alt={mockProduct.name}
                width={400}
                height={400}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {mockProduct.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${mockProduct.name} ${index + 1}`}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title and Basic Info */}
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{mockProduct.name}</h1>
                  <p className="text-lg text-muted-foreground mb-4">{mockProduct.nameEn}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">
                    {formatPrice(selectedVariant.price)}
                  </p>
                  <p className="text-sm text-muted-foreground">per piece</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary">{mockProduct.brandName}</Badge>
                <Badge variant="outline">{mockProduct.categoryName}</Badge>
                <Badge variant="outline">{mockProduct.productTypeName}</Badge>
              </div>

              <p className="text-muted-foreground mb-4">
                SKU: {mockProduct.sku}
              </p>

              <p className="text-muted-foreground leading-relaxed">
                {mockProduct.description}
              </p>
            </div>

            {/* Variant Selection */}
            <div>
              <Label className="text-base font-semibold mb-3 block">Select Variant</Label>
              <Select
                value={selectedVariant.id}
                onValueChange={(value) => {
                  const variant = mockProduct.variants.find(v => v.id === value)
                  if (variant) setSelectedVariant(variant)
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mockProduct.variants.map((variant) => (
                    <SelectItem key={variant.id} value={variant.id}>
                      {variant.name} - {formatPrice(variant.price)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Variant Attributes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(selectedVariant.attributes).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="font-medium capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <span className="text-muted-foreground">{value}</span>
                    </div>
                  ))}
                </div>
                <Separator className="my-4" />
                <div className="flex justify-between">
                  <span className="font-medium">Stock:</span>
                  <span className={selectedVariant.stock > 50 ? 'text-green-600' : 'text-orange-600'}>
                    {selectedVariant.stock} pieces
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Add to Schedule Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Add to Schedule</CardTitle>
                <CardDescription>
                  Add this product to your project schedule
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      max={selectedVariant.stock}
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="area">Area (Optional)</Label>
                    <Input
                      id="area"
                      placeholder="e.g., Living Room"
                      value={scheduleData.area}
                      onChange={(e) => setScheduleData(prev => ({ ...prev, area: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Input
                    id="notes"
                    placeholder="Additional notes..."
                    value={scheduleData.notes}
                    onChange={(e) => setScheduleData(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
                <Button
                  onClick={handleAddToSchedule}
                  className="w-full"
                  disabled={quantity > selectedVariant.stock}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Schedule
                </Button>
              </CardContent>
            </Card>

            {/* Downloads */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Downloads</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {mockProduct.datasheets.map((datasheet, index) => (
                  <Button key={index} variant="outline" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    Datasheet {index + 1}
                  </Button>
                ))}
                {mockProduct.cadFiles.map((cadFile, index) => (
                  <Button key={index} variant="outline" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    CAD File {index + 1}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockProduct.relatedProducts.map((product) => (
              <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                    <CardDescription>
                      <Badge variant="secondary">{product.brandName}</Badge>
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-primary">
                      {formatPrice(product.price)}
                    </span>
                    <Button size="sm" variant="outline" onClick={() => router.push(`/product/${product.id}`)}>
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}