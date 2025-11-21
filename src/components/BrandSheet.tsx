'use client';

import { useBrand, useUpdateBrand, useCreateBrand } from '@/hooks/useBrands';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { BrandForm } from '@/components/BrandForm';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';

interface BrandSheetProps {
  brandId?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
}

export function BrandSheet({ brandId, open, onOpenChange, onClose }: BrandSheetProps) {
  const router = useRouter();
  const isEditMode = !!brandId;
  const { data: brand, isLoading } = useBrand(brandId || null);
  const updateBrand = useUpdateBrand();
  const createBrand = useCreateBrand();

  const handleSubmit = async (data: any) => {
    if (isEditMode && brandId) {
      await updateBrand.mutateAsync({ id: brandId, data });
    } else {
      await createBrand.mutateAsync(data);
    }
    onClose();
    router.refresh();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditMode ? 'Edit Brand' : 'New Brand'}</SheetTitle>
          <SheetDescription>
            {isEditMode ? 'Update brand information' : 'Create a new brand'}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          {isEditMode && isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <BrandForm
              defaultValues={isEditMode && brand ? brand : undefined}
              onSubmit={handleSubmit}
              isLoading={isEditMode ? updateBrand.isPending : createBrand.isPending}
              submitLabel={isEditMode ? 'Update Brand' : 'Create Brand'}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

