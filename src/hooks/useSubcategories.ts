import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { subcategoryService, type Subcategory } from '@/services/subcategoryService'

export const subcategoryKeys = {
  all: ['subcategories'] as const,
  list: () => [...subcategoryKeys.all, 'list'] as const,
  detail: (id: string) => [...subcategoryKeys.all, 'detail', id] as const,
}

export function useSubcategories() {
  return useQuery({ queryKey: subcategoryKeys.list(), queryFn: () => subcategoryService.getAll() })
}

export function useCreateSubcategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Subcategory>) => subcategoryService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subcategoryKeys.list() })
      toast.success('Subcategory saved')
    },
    onError: (error: any) => toast.error(error?.response?.data?.error || 'Failed to save subcategory'),
  })
}

export function useUpdateSubcategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Subcategory> }) => subcategoryService.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: subcategoryKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: subcategoryKeys.list() })
      toast.success('Subcategory updated')
    },
    onError: (error: any) => toast.error(error?.response?.data?.error || 'Failed to update subcategory'),
  })
}

export function useDeleteSubcategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => subcategoryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subcategoryKeys.list() })
      toast.success('Subcategory deleted')
    },
    onError: (error: any) => toast.error(error?.response?.data?.error || 'Failed to delete subcategory'),
  })
}
