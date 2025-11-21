import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  productService,
  type Product,
  type CreateProductRequest,
  type UpdateProductRequest,
  type SearchProductsParams,
  type CatalogMeta,
} from '@/services/productService';

// Query keys
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters?: SearchProductsParams) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  search: (params?: SearchProductsParams) => [...productKeys.all, 'search', params] as const,
  suggestions: (q: string) => [...productKeys.all, 'suggestions', q] as const,
  catalogMeta: () => [...productKeys.all, 'catalog-meta'] as const,
};

// Get product by ID
export function useProduct(id: string | null) {
  return useQuery({
    queryKey: productKeys.detail(id!),
    queryFn: () => productService.getById(id!),
    enabled: !!id,
  });
}

// Search products
export function useSearchProducts(params: SearchProductsParams) {
  return useQuery({
    queryKey: productKeys.search(params),
    queryFn: () => productService.search(params),
    enabled: !!params.q || params.q === '',
  });
}

// Get search suggestions
export function useProductSuggestions(q: string, enabled = true) {
  return useQuery({
    queryKey: productKeys.suggestions(q),
    queryFn: () => productService.getSuggestions(q),
    enabled: enabled && q.length > 0,
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Get catalog metadata
export function useCatalogMeta() {
  return useQuery({
    queryKey: productKeys.catalogMeta(),
    queryFn: () => productService.getCatalogMeta(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Create product mutation
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductRequest) => productService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      toast.success('Product created successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error || 'Failed to create product';
      toast.error(message);
    },
  });
}

// Update product mutation
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductRequest }) =>
      productService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.id) });
      toast.success('Product updated successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error || 'Failed to update product';
      toast.error(message);
    },
  });
}

// Deactivate product mutation
export function useDeactivateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productService.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      toast.success('Product deactivated successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error || 'Failed to deactivate product';
      toast.error(message);
    },
  });
}

