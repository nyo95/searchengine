'use client';

import { useState } from 'react';
import { useSearchProducts } from '@/hooks/useProducts';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Plus, Search, Eye, Edit } from 'lucide-react';
import { ProductSheet } from '@/components/ProductSheet';

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isProductSheetOpen, setIsProductSheetOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);

  const { data: searchResult, isLoading } = useSearchProducts({
    q: searchQuery || undefined,
    page: 1,
    pageSize: 50,
    isActive: true,
  });

  const handleCreate = () => {
    setSelectedProductId(null);
    setIsCreateMode(true);
    setIsProductSheetOpen(true);
  };

  const handleView = (productId: string) => {
    setSelectedProductId(productId);
    setIsCreateMode(false);
    setIsProductSheetOpen(true);
  };

  const handleEdit = (productId: string) => {
    setSelectedProductId(productId);
    setIsCreateMode(false);
    setIsProductSheetOpen(true);
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 space-y-6 max-w-7xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Products</h1>
            <p className="text-muted-foreground">Manage your product catalog</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Product List</CardTitle>
            <CardDescription>All active products in the catalog</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products by SKU or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Subcategory</TableHead>
                    <TableHead>Internal Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {searchResult?.items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">
                        {searchQuery ? 'No products found matching your search.' : 'No products found. Create your first product to get started.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    searchResult?.items.map((product) => (
                      <TableRow
                        key={product.id}
                        className="cursor-pointer"
                        onClick={() => handleView(product.id)}
                      >
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
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleView(product.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(product.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <ProductSheet
          productId={isCreateMode ? null : selectedProductId || null}
          open={isProductSheetOpen}
          onOpenChange={(open) => {
            setIsProductSheetOpen(open);
            if (!open) {
              setSelectedProductId(null);
              setIsCreateMode(false);
            }
          }}
          onClose={() => {
            setSelectedProductId(null);
            setIsCreateMode(false);
            setIsProductSheetOpen(false);
          }}
        />
      </div>
    </AppLayout>
  );
}

