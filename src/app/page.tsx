'use client';

import { useState } from 'react';
import { useSearchProducts, useCatalogMeta } from '@/hooks/useProducts';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, X, Eye, Edit } from 'lucide-react';
import { ProductSheet } from '@/components/ProductSheet';
import { useBrands } from '@/hooks/useBrands';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');

  const ALL_BRANDS = '__ALL_BRANDS__';
  const ALL_CATEGORIES = '__ALL_CATEGORIES__';
  const ALL_SUBCATEGORIES = '__ALL_SUBCATEGORIES__';

  const [selectedBrandId, setSelectedBrandId] = useState<string>(ALL_BRANDS);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(ALL_CATEGORIES);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>(ALL_SUBCATEGORIES);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isProductSheetOpen, setIsProductSheetOpen] = useState(false);

  const { data: searchResult, isLoading } = useSearchProducts({
    q: searchQuery || undefined,
    brandId: selectedBrandId === ALL_BRANDS ? undefined : selectedBrandId,
    categoryId: selectedCategoryId === ALL_CATEGORIES ? undefined : selectedCategoryId,
    subcategoryId:
      selectedSubcategoryId === ALL_SUBCATEGORIES ? undefined : selectedSubcategoryId,
    page: 1,
    pageSize: 50,
    isActive: true,
  });

  const { data: catalogMeta } = useCatalogMeta();
  const { data: brands } = useBrands();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is triggered automatically by the query
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedBrandId(ALL_BRANDS);
    setSelectedCategoryId(ALL_CATEGORIES);
    setSelectedSubcategoryId(ALL_SUBCATEGORIES);
  };

  const handleViewProduct = (productId: string) => {
    setSelectedProductId(productId);
    setIsProductSheetOpen(true);
  };

  const handleEditProduct = (productId: string) => {
    setSelectedProductId(productId);
    setIsProductSheetOpen(true);
  };

  const hasActiveFilters =
    Boolean(searchQuery) ||
    selectedBrandId !== ALL_BRANDS ||
    selectedCategoryId !== ALL_CATEGORIES ||
    selectedSubcategoryId !== ALL_SUBCATEGORIES;

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 space-y-6 max-w-7xl">
        <div>
          <h1 className="text-3xl font-bold">Material Search Engine</h1>
          <p className="text-muted-foreground">Search materials, SKU, or brand</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Search</CardTitle>
            <CardDescription>Find products by name, SKU, brand, or category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search materials, SKU, or brand..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSearch(e);
                    }
                  }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select value={selectedBrandId} onValueChange={setSelectedBrandId}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Brands" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_BRANDS}>All Brands</SelectItem>
                    {brands?.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_CATEGORIES}>All Categories</SelectItem>
                    {catalogMeta?.categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex gap-2">
                  <Select value={selectedSubcategoryId} onValueChange={setSelectedSubcategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Subcategories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_SUBCATEGORIES}>All Subcategories</SelectItem>
                      {/* Subcategories would need to be fetched separately or from catalog meta */}
                    </SelectContent>
                  </Select>
                  {hasActiveFilters && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleResetFilters}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>
              {searchResult
                ? `Found ${searchResult.total} product${searchResult.total !== 1 ? 's' : ''}`
                : 'Enter a search query to find products'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : searchResult?.items.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {searchQuery || hasActiveFilters
                  ? 'No products found matching your search.'
                  : 'Enter a search query or select filters to find products.'}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Subcategory</TableHead>
                    <TableHead>Internal Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {searchResult?.items.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.brand.name}</TableCell>
                      <TableCell>{product.category?.name || '-'}</TableCell>
                      <TableCell>
                        {product.subcategory?.name || '-'}
                        {product.subcategory?.prefix && (
                          <span className="text-xs text-muted-foreground ml-1">
                            ({product.subcategory.prefix})
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-sm">{product.internalCode}</TableCell>
                      <TableCell>
                        <Badge variant={product.isActive ? 'default' : 'secondary'}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewProduct(product.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditProduct(product.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {selectedProductId && (
          <ProductSheet
            productId={selectedProductId}
            open={isProductSheetOpen}
            onOpenChange={setIsProductSheetOpen}
            onClose={() => {
              setSelectedProductId(null);
              setIsProductSheetOpen(false);
            }}
          />
        )}
      </div>
    </AppLayout>
  );
}
