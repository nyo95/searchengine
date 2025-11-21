import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { brandService, type Brand, type CreateBrandRequest, type UpdateBrandRequest } from '@/services/brandService';

// Query keys
export const brandKeys = {
  all: ['brands'] as const,
  lists: () => [...brandKeys.all, 'list'] as const,
  list: () => [...brandKeys.lists()] as const,
  details: () => [...brandKeys.all, 'detail'] as const,
  detail: (id: string) => [...brandKeys.details(), id] as const,
};

// Get all brands
export function useBrands() {
  return useQuery({
    queryKey: brandKeys.list(),
    queryFn: () => brandService.getAll(),
  });
}

// Get brand by ID
export function useBrand(id: string | null) {
  return useQuery({
    queryKey: brandKeys.detail(id!),
    queryFn: () => brandService.getById(id!),
    enabled: !!id,
  });
}

// Create brand mutation
export function useCreateBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBrandRequest) => brandService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandKeys.list() });
      toast.success('Brand created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create brand');
    },
  });
}

// Update brand mutation
export function useUpdateBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBrandRequest }) =>
      brandService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: brandKeys.list() });
      queryClient.invalidateQueries({ queryKey: brandKeys.detail(variables.id) });
      toast.success('Brand updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update brand');
    },
  });
}

// Soft delete brand mutation
export function useSoftDeleteBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => brandService.softDelete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandKeys.list() });
      toast.success('Brand deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete brand');
    },
  });
}

// Restore brand mutation
export function useRestoreBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => brandService.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandKeys.list() });
      toast.success('Brand restored successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to restore brand');
    },
  });
}

