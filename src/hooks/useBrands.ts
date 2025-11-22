import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { brandService, type Brand, type CreateBrandRequest, type UpdateBrandRequest } from '@/services/brandService'

export const brandKeys = {
  all: ['brands'] as const,
  list: (search?: string) => [...brandKeys.all, search] as const,
  detail: (id: string) => [...brandKeys.all, 'detail', id] as const,
}

export function useBrands(search?: string) {
  return useQuery({
    queryKey: brandKeys.list(search),
    queryFn: () => brandService.getAll(search),
  })
}

export function useCreateBrand() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateBrandRequest) => brandService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandKeys.all })
      toast.success('Brand saved')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || 'Failed to save brand')
    },
  })
}

export function useUpdateBrand() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBrandRequest }) => brandService.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: brandKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: brandKeys.all })
      toast.success('Brand updated')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || 'Failed to update brand')
    },
  })
}

export function useDeleteBrand() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => brandService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandKeys.all })
      toast.success('Brand deleted')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || 'Failed to delete brand')
    },
  })
}
