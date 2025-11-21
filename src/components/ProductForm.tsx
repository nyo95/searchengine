'use client';

import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Plus, Trash2 } from 'lucide-react';
import { type CreateProductRequest, type UpdateProductRequest } from '@/services/productService';
import { useCatalogMeta } from '@/hooks/useProducts';
import { useBrands } from '@/hooks/useBrands';
import { Skeleton } from '@/components/ui/skeleton';

const productSchema = z.object({
  sku: z.string().min(1, 'SKU is required'),
  name: z.string().min(1, 'Name is required'),
  brandId: z.string().min(1, 'Brand is required'),
  categoryName: z.string().min(1, 'Category is required'),
  subcategoryName: z.string().min(1, 'Subcategory is required'),
  description: z.string().optional(),
  imageUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  dynamicAttributes: z.array(
    z.object({
      key: z.string().min(1, 'Key is required'),
      value: z.string().min(1, 'Value is required'),
    })
  ).optional(),
  tags: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  defaultValues?: Partial<ProductFormValues & { dynamicAttributes?: Record<string, unknown> }>;
  onSubmit: (data: CreateProductRequest | UpdateProductRequest) => void | Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

export function ProductForm({ defaultValues, onSubmit, isLoading, submitLabel = 'Submit' }: ProductFormProps) {
  const { data: brands, isLoading: brandsLoading } = useBrands();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      sku: defaultValues?.sku || '',
      name: defaultValues?.name || '',
      brandId: defaultValues?.brandId || '',
      categoryName: defaultValues?.categoryName || '',
      subcategoryName: defaultValues?.subcategoryName || '',
      description: defaultValues?.description || '',
      imageUrl: defaultValues?.imageUrl || '',
      dynamicAttributes: defaultValues?.dynamicAttributes
        ? Object.entries(defaultValues.dynamicAttributes).map(([key, value]) => ({
            key,
            value: String(value),
          }))
        : [],
      tags: defaultValues?.tags ? (Array.isArray(defaultValues.tags) ? defaultValues.tags.join(', ') : String(defaultValues.tags)) : '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'dynamicAttributes',
  });

  const handleSubmit = async (data: ProductFormValues) => {
    // Convert dynamic attributes array to object
    const dynamicAttributes = data.dynamicAttributes?.reduce(
      (acc, attr) => {
        if (attr.key && attr.value) {
          acc[attr.key] = attr.value;
        }
        return acc;
      },
      {} as Record<string, string>
    );

    // Parse tags
    const tags = data.tags
      ? data.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean)
      : undefined;

    const cleanedData: CreateProductRequest | UpdateProductRequest = {
      sku: data.sku,
      name: data.name,
      brandId: data.brandId,
      categoryName: data.categoryName,
      subcategoryName: data.subcategoryName,
      description: data.description || undefined,
      imageUrl: data.imageUrl || undefined,
      ...(dynamicAttributes && Object.keys(dynamicAttributes).length > 0
        ? { dynamicAttributes }
        : {}),
      ...(tags && tags.length > 0 ? { tags } : {}),
    };

    await onSubmit(cleanedData);
  };

  if (brandsLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="sku"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SKU *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="HT-6060-WH-X" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Homogeneous Tile White 60x60" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="brandId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Brand *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a brand" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {brands?.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoryName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Material" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subcategoryName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subcategory *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Homogeneous Tile" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Product description" rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input {...field} type="url" placeholder="https://example.com/image.jpg" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <Label>Dynamic Attributes</Label>
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <FormField
                control={form.control}
                name={`dynamicAttributes.${index}.key`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input {...field} placeholder="Attribute key (e.g., size)" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`dynamicAttributes.${index}.value`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input {...field} placeholder="Attribute value (e.g., 600x600)" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ key: '', value: '' })}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Attribute
          </Button>
        </div>

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <Input {...field} placeholder="tag1, tag2, tag3" />
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

