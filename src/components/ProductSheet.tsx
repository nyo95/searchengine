'use client';

import { useEffect } from 'react';
import { useProduct, useUpdateProduct, useCreateProduct } from '@/hooks/useProducts';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ProductForm } from '@/components/ProductForm';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';

interface ProductSheetProps {
  productId?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
}

export function ProductSheet({ productId, open, onOpenChange, onClose }: ProductSheetProps) {
  const router = useRouter();
  const isEditMode = !!productId;
  const { data: product, isLoading } = useProduct(productId || null);
  const updateProduct = useUpdateProduct();
  const createProduct = useCreateProduct();

  const handleSubmit = async (data: any) => {
    if (isEditMode && productId) {
      await updateProduct.mutateAsync({ id: productId, data });
    } else {
      await createProduct.mutateAsync(data);
    }
    onClose();
    // Refresh the page data
    router.refresh();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditMode ? 'Edit Product' : 'New Product'}</SheetTitle>
          <SheetDescription>
            {isEditMode
              ? 'Update product information'
              : 'Create a new product in the catalog'}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          {isEditMode && isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <ProductForm
              defaultValues={
                isEditMode && product
                  ? {
                      sku: product.sku,
                      name: product.name,
                      brandId: product.brandId,
                      categoryName: product.category?.name || '',
                      subcategoryName: product.subcategory?.name || '',
                      description: product.description || '',
                      imageUrl: product.imageUrl || '',
                      dynamicAttributes: product.dynamicAttributes as Record<string, unknown> | undefined,
                      tags: product.tags,
                    }
                  : undefined
              }
              onSubmit={handleSubmit}
              isLoading={isEditMode ? updateProduct.isPending : createProduct.isPending}
              submitLabel={isEditMode ? 'Update Product' : 'Create Product'}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

