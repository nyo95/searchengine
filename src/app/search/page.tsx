'use client';

import { useSearchParams } from 'next/navigation';
import { useSearchProducts } from '@/hooks/useProducts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { SearchBar } from '@/components/SearchBar';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const brandId = searchParams.get('brandId') || undefined;
  const categoryId = searchParams.get('categoryId') || undefined;
  const subcategoryId = searchParams.get('subcategoryId') || undefined;
  const page = parseInt(searchParams.get('page') || '1', 10);

  const { data: searchResult, isLoading, error } = useSearchProducts({
    q: query,
    brandId,
    categoryId,
    subcategoryId,
    page,
    pageSize: 20,
    isActive: true,
  });

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">Failed to search products. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Search Products</h1>
          <p className="text-muted-foreground">Find products in the catalog</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search</CardTitle>
          <CardDescription>Enter keywords to search for products</CardDescription>
        </CardHeader>
        <CardContent>
          <SearchBar />
        </CardContent>
      </Card>

      {query && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
            <CardDescription>
              {searchResult
                ? `Found ${searchResult.total} product${searchResult.total !== 1 ? 's' : ''}`
                : 'Searching...'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : searchResult?.items.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No products found matching &quot;{query}&quot;
              </p>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Internal Code</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {searchResult?.items.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                        <TableCell className="font-medium">
                          <Link
                            href={`/products/${product.id}/edit`}
                            className="hover:underline"
                          >
                            {product.name}
                          </Link>
                        </TableCell>
                        <TableCell>{product.brand.name}</TableCell>
                        <TableCell>
                          {product.category?.name}
                          {product.subcategory && ` / ${product.subcategory.name}`}
                        </TableCell>
                        <TableCell className="font-mono text-sm">{product.internalCode}</TableCell>
                        <TableCell>
                          <Badge variant={product.isActive ? 'default' : 'secondary'}>
                            {product.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {searchResult && searchResult.hasMore && (
                  <div className="mt-4 text-center">
                    <Link
                      href={`/search?q=${encodeURIComponent(query)}&page=${page + 1}`}
                    >
                      <Button variant="outline">Load More</Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {!query && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Enter a search query above to find products
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
