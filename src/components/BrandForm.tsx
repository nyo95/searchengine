'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { type CreateBrandRequest, type UpdateBrandRequest } from '@/services/brandService';

const brandSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  phone: z.string().optional(),
  salesName: z.string().optional(),
  salesContact: z.string().email('Must be a valid email').optional().or(z.literal('')),
});

type BrandFormValues = z.infer<typeof brandSchema>;

interface BrandFormProps {
  defaultValues?: Partial<BrandFormValues>;
  onSubmit: (data: CreateBrandRequest | UpdateBrandRequest) => void | Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

export function BrandForm({ defaultValues, onSubmit, isLoading, submitLabel = 'Submit' }: BrandFormProps) {
  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: defaultValues?.name || '',
      website: defaultValues?.website || '',
      phone: defaultValues?.phone || '',
      salesName: defaultValues?.salesName || '',
      salesContact: defaultValues?.salesContact || '',
    },
  });

  const handleSubmit = async (data: BrandFormValues) => {
    // Clean up empty strings to undefined for optional fields
    const cleanedData = {
      name: data.name,
      website: data.website || undefined,
      phone: data.phone || undefined,
      salesName: data.salesName || undefined,
      salesContact: data.salesContact || undefined,
    };
    await onSubmit(cleanedData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Brand name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website</FormLabel>
              <FormControl>
                <Input {...field} type="url" placeholder="https://example.com" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input {...field} placeholder="08123456789" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="salesName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sales Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Sales person name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="salesContact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sales Contact</FormLabel>
              <FormControl>
                <Input {...field} type="email" placeholder="sales@example.com" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Saving...' : submitLabel}
        </Button>
      </form>
    </Form>
  );
}

