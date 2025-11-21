'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useProduct, useUpdateProduct } from '@/hooks/useProducts';
import { ProductForm } from '@/components/ProductForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const router = useRouter();
  // Handle both Promise and sync params for Next.js 15 compatibility
  const resolvedParams = 'then' in params ? use(params) : params;
  const id = resolvedParams.id;
  const { data: product, isLoading, error } = useProduct(id);
  const updateProduct = useUpdateProduct();

  const handleSubmit = async (data: any) => {
    await updateProduct.mutateAsync({ id, data });
    router.push('/products');
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">Failed to load product. Please try again.</p>
            <Link href="/products">
              <Button variant="outline" className="mt-4">
                Back to Products
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/products">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Product</h1>
          <p className="text-muted-foreground">Update product information</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
          <CardDescription>Update the product details</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : product ? (
            <ProductForm
              defaultValues={{
                sku: product.sku,
                name: product.name,
                brandId: product.brandId,
                categoryName: product.category?.name || '',
                subcategoryName: product.subcategory?.name || '',
                description: product.description || '',
                imageUrl: product.imageUrl || '',
                dynamicAttributes: product.dynamicAttributes as Record<string, unknown> | undefined,
                tags: product.tags,
              }}
              onSubmit={handleSubmit}
              isLoading={updateProduct.isPending}
              submitLabel="Update Product"
            />
          ) : (
            <p className="text-muted-foreground">Product not found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

