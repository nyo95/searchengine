import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  productService,
  type CreateProductRequest,
  type UpdateProductRequest,
  type SearchProductsParams,
} from '@/services/productService'

export const productKeys = {
  all: ['products'] as const,
  list: (filters?: SearchProductsParams) => [...productKeys.all, filters] as const,
  detail: (id: string) => [...productKeys.all, 'detail', id] as const,
}

export function useSearchProducts(filters?: SearchProductsParams) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => productService.search(filters),
  })
}

export function useProduct(id: string | null) {
  return useQuery({
    queryKey: productKeys.detail(id!),
    queryFn: () => productService.getById(id!),
    enabled: !!id,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateProductRequest) => productService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
      toast.success('Product saved')
    },
    onError: (error: any) => toast.error(error?.response?.data?.error || 'Failed to save product'),
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductRequest }) => productService.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: productKeys.all })
      toast.success('Product updated')
    },
    onError: (error: any) => toast.error(error?.response?.data?.error || 'Failed to update product'),
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => productService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
      toast.success('Product deleted')
    },
    onError: (error: any) => toast.error(error?.response?.data?.error || 'Failed to delete product'),
  })
}
