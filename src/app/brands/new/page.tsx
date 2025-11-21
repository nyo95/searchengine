'use client';

import { useRouter } from 'next/navigation';
import { useCreateBrand } from '@/hooks/useBrands';
import { BrandForm } from '@/components/BrandForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewBrandPage() {
  const router = useRouter();
  const createBrand = useCreateBrand();

  const handleSubmit = async (data: any) => {
    await createBrand.mutateAsync(data);
    router.push('/brands');
  };

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
          <h1 className="text-3xl font-bold">New Brand</h1>
          <p className="text-muted-foreground">Create a new brand</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Brand Information</CardTitle>
          <CardDescription>Enter the details for the new brand</CardDescription>
        </CardHeader>
        <CardContent>
          <BrandForm
            onSubmit={handleSubmit}
            isLoading={createBrand.isPending}
            submitLabel="Create Brand"
          />
        </CardContent>
      </Card>
    </div>
  );
}

