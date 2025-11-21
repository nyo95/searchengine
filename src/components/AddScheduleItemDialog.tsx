'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSearchProducts } from '@/hooks/useProducts';
import { type CreateScheduleItemRequest } from '@/services/scheduleService';
import { Plus } from 'lucide-react';

const scheduleItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  code: z.string().optional(),
  area: z.string().optional(),
  locationNote: z.string().optional(),
  usageNote: z.string().optional(),
  sortOrder: z.number().optional(),
});

type ScheduleItemFormValues = z.infer<typeof scheduleItemSchema>;

interface AddScheduleItemDialogProps {
  projectId: string;
  onSubmit: (data: CreateScheduleItemRequest) => Promise<void>;
  isLoading?: boolean;
}

export function AddScheduleItemDialog({
  projectId,
  onSubmit,
  isLoading,
}: AddScheduleItemDialogProps) {
  const [open, setOpen] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  const { data: searchResult } = useSearchProducts({
    q: productSearch,
    pageSize: 10,
    isActive: true,
  });

  const form = useForm<ScheduleItemFormValues>({
    resolver: zodResolver(scheduleItemSchema),
    defaultValues: {
      productId: '',
      code: '',
      area: '',
      locationNote: '',
      usageNote: '',
      sortOrder: undefined,
    },
  });

  const selectedProduct = searchResult?.items.find(
    (p) => p.id === form.watch('productId')
  );

  const handleSubmit = async (data: ScheduleItemFormValues) => {
    const cleanedData: CreateScheduleItemRequest = {
      productId: data.productId,
      code: data.code || undefined,
      area: data.area || null,
      locationNote: data.locationNote || null,
      usageNote: data.usageNote || null,
      sortOrder: data.sortOrder || null,
    };
    await onSubmit(cleanedData);
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Schedule Item</DialogTitle>
          <DialogDescription>Add a new product to the project schedule</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="space-y-2">
              <FormLabel>Search Product</FormLabel>
              <Input
                placeholder="Search products..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />
            </div>

            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!productSearch}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a product" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {searchResult?.items.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{product.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {product.sku} • {product.internalCode} • {product.brand.name}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                      {searchResult?.items.length === 0 && productSearch && (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                          No products found
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  {selectedProduct && (
                    <p className="text-xs text-muted-foreground">
                      Default code: {selectedProduct.internalCode}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Schedule Code</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={selectedProduct?.internalCode || 'Leave empty to use product internal code'}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="area"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Area</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Master Bedroom" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="locationNote"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Note</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Floor" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="usageNote"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Usage Note</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="e.g., Main tile" rows={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sortOrder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sort Order</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="1"
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Adding...' : 'Add Item'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

