'use client';

import { useState } from 'react';
import { useBrands } from '@/hooks/useBrands';
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
import { Plus, Search, Edit } from 'lucide-react';
import { BrandSheet } from '@/components/BrandSheet';

export default function BrandsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [isBrandSheetOpen, setIsBrandSheetOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);

  const { data: brands, isLoading } = useBrands();

  const filteredBrands = brands?.filter((brand) =>
    brand.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleCreate = () => {
    setSelectedBrandId(null);
    setIsCreateMode(true);
    setIsBrandSheetOpen(true);
  };

  const handleEdit = (brandId: string) => {
    setSelectedBrandId(brandId);
    setIsCreateMode(false);
    setIsBrandSheetOpen(true);
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 space-y-6 max-w-7xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Brands</h1>
            <p className="text-muted-foreground">Manage your brand catalog</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Brand
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Brand List</CardTitle>
            <CardDescription>All active brands in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search brands..."
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
                    <TableHead>Name</TableHead>
                    <TableHead>Website</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Sales Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBrands.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        {searchQuery ? 'No brands found matching your search.' : 'No brands found. Create your first brand to get started.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBrands.map((brand) => (
                      <TableRow key={brand.id}>
                        <TableCell className="font-medium">{brand.name}</TableCell>
                        <TableCell>
                          {brand.website ? (
                            <a
                              href={brand.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {brand.website}
                            </a>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>{brand.phone || <span className="text-muted-foreground">-</span>}</TableCell>
                        <TableCell>
                          {brand.salesName && (
                            <div>
                              <div>{brand.salesName}</div>
                              {brand.salesContact && (
                                <div className="text-sm text-muted-foreground">{brand.salesContact}</div>
                              )}
                            </div>
                          )}
                          {!brand.salesName && <span className="text-muted-foreground">-</span>}
                        </TableCell>
                        <TableCell>
                          <Badge variant={brand.isActive ? 'default' : 'secondary'}>
                            {brand.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(brand.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <BrandSheet
          brandId={isCreateMode ? null : selectedBrandId || null}
          open={isBrandSheetOpen}
          onOpenChange={(open) => {
            setIsBrandSheetOpen(open);
            if (!open) {
              setSelectedBrandId(null);
              setIsCreateMode(false);
            }
          }}
          onClose={() => {
            setSelectedBrandId(null);
            setIsCreateMode(false);
            setIsBrandSheetOpen(false);
          }}
        />
      </div>
    </AppLayout>
  );
}

