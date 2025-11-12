'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Filter, Plus, Eye, TrendingUp, Download, Package } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Mock data for demonstration
const mockProducts = [
  {
    id: '1',
    name: 'Downlight LED 3W 3000K',
    nameEn: 'Downlight LED 3W 3000K',
    brand: 'Philips',
    category: 'Lighting',
    sku: 'PH-DL-3W-30K',
    price: 150000,
    image: '/api/placeholder/200/200',
    attributes: { wattage: '3W', cri: '90', cct: '3000K', beamAngle: '120°' },
    viewCount: 245,
    usageCount: 89
  },
  {
    id: '2',
    name: 'HPL Taco Walnut',
    nameEn: 'HPL Taco Walnut',
    brand: 'Taco',
    category: 'Material',
    sku: 'TC-HPL-WNT-001',
    price: 280000,
    image: '/api/placeholder/200/200',
    attributes: { thickness: '1.2mm', finish: 'Textured', color: 'Walnut', size: '1220x2440mm' },
    viewCount: 189,
    usageCount: 67
  },
  {
    id: '3',
    name: 'Ergonomic Office Chair',
    nameEn: 'Ergonomic Office Chair',
    brand: 'Herman Miller',
    category: 'Furniture',
    sku: 'HM-CHAIR-ERG-01',
    price: 8500000,
    image: '/api/placeholder/200/200',
    attributes: { material: 'Mesh', color: 'Black', adjustableHeight: true, lumbarSupport: true },
    viewCount: 156,
    usageCount: 45
  }
]

const mockSuggestions = [
  'downlight 3000K',
  'HPL Taco',
  'ergonomic chair',
  'lampu sorot',
  'vinyl flooring',
  'solid surface'
]

const mockCategories = [
  { id: 'lighting', name: 'Lighting', nameEn: 'Lighting' },
  { id: 'material', name: 'Material', nameEn: 'Material' },
  { id: 'furniture', name: 'Furniture', nameEn: 'Furniture' },
  { id: 'hardware', name: 'Hardware', nameEn: 'Hardware' }
]

const mockBrands = [
  { id: 'philips', name: 'Philips' },
  { id: 'taco', name: 'Taco' },
  { id: 'herman-miller', name: 'Herman Miller' },
  { id: 'local', name: 'Local Brand' }
]

export default function Home() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [showFilters, setShowFilters] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [isDownloading, setIsDownloading] = useState(false)
  const searchInputRef = useRef(null)

  // Search function using API
  const performSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    try {
      const params = new URLSearchParams({
        q: query,
        category: selectedCategory,
        brand: selectedBrand,
        minPrice: priceRange.min,
        maxPrice: priceRange.max,
        limit: '20'
      })

      const response = await fetch(`/api/search?${params}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.products || [])
      } else {
        // Fallback to mock data if API fails
        const filtered = mockProducts.filter(product => 
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.nameEn.toLowerCase().includes(query.toLowerCase()) ||
          product.brand.toLowerCase().includes(query.toLowerCase()) ||
          product.sku.toLowerCase().includes(query.toLowerCase()) ||
          product.category.toLowerCase().includes(query.toLowerCase())
        )
        setSearchResults(filtered)
      }
    } catch (error) {
      console.error('Search error:', error)
      // Fallback to mock data
      const filtered = mockProducts.filter(product => 
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.nameEn.toLowerCase().includes(query.toLowerCase()) ||
        product.brand.toLowerCase().includes(query.toLowerCase()) ||
        product.sku.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase())
      )
      setSearchResults(filtered)
    }
  }

  // Suggestions function using API
  const updateSuggestions = async (query) => {
    if (!query.trim()) {
      setSuggestions([])
      return
    }

    try {
      const response = await fetch(`/api/suggestions?q=${encodeURIComponent(query)}&limit=5`)
      if (response.ok) {
        const data = await response.json()
        setSuggestions(data.suggestions || [])
      } else {
        // Fallback to mock data
        const filteredSuggestions = mockSuggestions.filter(suggestion =>
          suggestion.toLowerCase().includes(query.toLowerCase())
        )
        setSuggestions(filteredSuggestions.slice(0, 5))
      }
    } catch (error) {
      console.error('Suggestions error:', error)
      // Fallback to mock data
      const filteredSuggestions = mockSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(query.toLowerCase())
      )
      setSuggestions(filteredSuggestions.slice(0, 5))
    }
  }

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      performSearch(searchQuery)
      updateSuggestions(searchQuery)
    }, 300)

    return () => clearTimeout(delayedSearch)
  }, [searchQuery])

  const handleSearch = (query) => {
    setSearchQuery(query)
    setShowSuggestions(false)
    // Track search activity
    fetch('/api/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'anonymous',
        type: 'SEARCH',
        searchQuery: query,
        filters: {
          category: selectedCategory,
          brand: selectedBrand,
          minPrice: priceRange.min,
          maxPrice: priceRange.max
        }
      })
    }).catch(error => console.error('Error tracking search:', error))
  }

  const handleProductClick = (product) => {
    // Track product view
    fetch('/api/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'anonymous',
        type: 'VIEW_PRODUCT',
        productId: product.id
      })
    }).catch(error => console.error('Error tracking view:', error))
    
    // Navigate to product detail page
    router.push(`/product/${product.id}`)
  }

  const handleAddToSchedule = async (product) => {
    try {
      const response = await fetch('/api/schedule/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduleId: 'default',
          productId: product.id,
          productName: product.name,
          brandName: product.brand,
          sku: product.sku,
          price: product.price,
          attributes: product.attributes,
          quantity: 1,
          unitOfMeasure: 'pcs'
        })
      })

      if (response.ok) {
        alert('Product added to schedule!')
        
        // Track add to schedule activity
        fetch('/api/activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 'anonymous',
            type: 'ADD_TO_SCHEDULE',
            productId: product.id
          })
        }).catch(error => console.error('Error tracking schedule add:', error))
      } else {
        alert('Failed to add to schedule')
      }
    } catch (error) {
      console.error('Error adding to schedule:', error)
      alert('Failed to add to schedule')
    }
  }

  const downloadProjectZip = async () => {
    setIsDownloading(true)
    try {
      console.log('Starting download...')
      
      // Method 1: Try blob download
      const response = await fetch('/api/download/project')
      console.log('Response status:', response.status)
      
      if (response.ok) {
        const blob = await response.blob()
        console.log('Blob size:', blob.size)
        
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'architecture-product-catalog.tar.gz'
        a.style.display = 'none'
        document.body.appendChild(a)
        a.click()
        
        // Cleanup
        setTimeout(() => {
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
        }, 100)
        
        console.log('Download completed')
        setIsDownloading(false)
      } else {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (error) {
      console.error('Download error:', error)
      
      // Method 2: Fallback to direct link
      try {
        const link = document.createElement('a')
        link.href = '/api/download/project'
        link.download = 'architecture-product-catalog.tar.gz'
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        console.log('Fallback download initiated')
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError)
        alert('Download failed. Please right-click and save this link: /api/download/project')
      }
      
      setIsDownloading(false)
    }
  }

  const simpleDownload = () => {
    // Method 3: Simple window.open fallback
    window.open('/api/download/project', '_blank')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Search className="w-4 h-4 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-semibold">Product Catalog</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/insights')}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Insights
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/schedule')}
              >
                Schedule
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={downloadProjectZip}
                title="Download Full Project Source Code"
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-gray-300 border-t-transparent"></div>
                    Downloading...
                  </>
                ) : (
                  <>
                    <Package className="w-4 h-4 mr-2" />
                    Download
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Search Section */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Search products... (e.g., downlight 3000K, HPL Taco, kursi, chair)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="pl-12 pr-12 h-14 text-lg"
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowFilters(!showFilters)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                <Filter className="w-4 h-4" />
              </Button>
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg z-50">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-2"
                    onClick={() => handleSearch(suggestion)}
                  >
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <span>{suggestion}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Filters */}
          {showFilters && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="brand">Brand</Label>
                    <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockBrands.map((brand) => (
                          <SelectItem key={brand.id} value={brand.id}>
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Price Range</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Min"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                      />
                      <Input
                        placeholder="Max"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Results Section */}
        <div className="max-w-6xl mx-auto">
          {searchQuery && (
            <div className="mb-6">
              <p className="text-muted-foreground">
                Found {searchResults.length} results for "{searchQuery}"
              </p>
            </div>
          )}

          {/* Tabs for different views */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All Results</TabsTrigger>
              <TabsTrigger value="popular">Popular</TabsTrigger>
              <TabsTrigger value="recent">Recently Used</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((product) => (
                  <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="space-y-1">
                        <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Badge variant="secondary">{product.brand}</Badge>
                          <Badge variant="outline">{product.category}</Badge>
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-primary">
                          Rp {product.price.toLocaleString('id-ID')}
                        </span>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Eye className="w-3 h-3" />
                          <span>{product.viewCount}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm font-medium">SKU: {product.sku}</p>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(product.attributes).map(([key, value]) => (
                            <Badge key={key} variant="outline" className="text-xs">
                              {key}: {value}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleProductClick(product)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleAddToSchedule(product)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="popular" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockProducts
                  .sort((a, b) => b.usageCount - a.usageCount)
                  .map((product) => (
                    <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="space-y-1">
                          <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <Badge variant="secondary">{product.brand}</Badge>
                            <Badge variant="outline">{product.category}</Badge>
                          </CardDescription>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-2xl font-bold text-primary">
                            Rp {product.price.toLocaleString('id-ID')}
                          </span>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <TrendingUp className="w-3 h-3" />
                            <span>{product.usageCount} uses</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="recent" className="mt-6">
              <div className="text-center py-12">
                <p className="text-muted-foreground">No recently used products yet.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Products you use frequently will appear here.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          {/* Empty State */}
          {!searchQuery && searchResults.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Start Searching</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Search for products by name, brand, SKU, or attributes. Try searching for "downlight", "HPL", "chair", or any product you need.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                {mockSuggestions.slice(0, 4).map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSearch(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
              
              {/* Download Section */}
              <Card className="max-w-md mx-auto">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Download Full Project
                  </CardTitle>
                  <CardDescription>
                    Get the complete source code for this architecture & interior product catalog system
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>✅ Complete Next.js 15 fullstack application</p>
                    <p>✅ Advanced search engine with learning capabilities</p>
                    <p>✅ Schedule builder with export features</p>
                    <p>✅ Analytics dashboard and insights</p>
                    <p>✅ Responsive design with modern UI</p>
                  </div>
                  <Button 
                    onClick={downloadProjectZip}
                    className="w-full"
                    size="lg"
                    disabled={isDownloading}
                  >
                    {isDownloading ? (
                      <>
                        <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-gray-300 border-t-transparent"></div>
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Download Project Source Code
                      </>
                    )}
                  </Button>
                  <div className="flex gap-2 justify-center mt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={simpleDownload}
                      disabled={isDownloading}
                    >
                      Open in New Tab
                    </Button>
                    <button 
                      onClick={() => navigator.clipboard.writeText(window.location.origin + '/api/download/project')}
                      className="text-xs text-primary underline hover:no-underline"
                      disabled={isDownloading}
                    >
                      Copy Download Link
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Format: .tar.gz (710MB) • Ready for production
                  </p>
                  <div className="text-xs text-center text-muted-foreground mt-2">
                    Need help? Check{' '}
                    <button 
                      onClick={() => window.open('/DOWNLOAD_STATUS.md', '_blank')}
                      className="text-primary underline hover:no-underline"
                    >
                      download status
                    </button>
                    {' '}or{' '}
                    <button 
                      onClick={() => window.open('/DOWNLOAD_INSTRUCTIONS.md', '_blank')}
                      className="text-primary underline hover:no-underline"
                    >
                      instructions
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}