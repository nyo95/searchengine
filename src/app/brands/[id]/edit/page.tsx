'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useBrand, useUpdateBrand } from '@/hooks/useBrands';
import { BrandForm } from '@/components/BrandForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditBrandPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const router = useRouter();
  // Handle both Promise and sync params for Next.js 15 compatibility
  const resolvedParams = 'then' in params ? use(params) : params;
  const id = resolvedParams.id;
  const { data: brand, isLoading, error } = useBrand(id);
  const updateBrand = useUpdateBrand();

  const handleSubmit = async (data: any) => {
    await updateBrand.mutateAsync({ id, data });
    router.push('/brands');
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">Failed to load brand. Please try again.</p>
            <Link href="/brands">
              <Button variant="outline" className="mt-4">
                Back to Brands
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
        <Link href="/brands">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Brand</h1>
          <p className="text-muted-foreground">Update brand information</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Brand Information</CardTitle>
          <CardDescription>Update the brand details</CardDescription>
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
          ) : brand ? (
            <BrandForm
              defaultValues={brand}
              onSubmit={handleSubmit}
              isLoading={updateBrand.isPending}
              submitLabel="Update Brand"
            />
          ) : (
            <p className="text-muted-foreground">Brand not found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

