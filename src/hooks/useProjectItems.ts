import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  scheduleService,
  type ScheduleItem,
  type CreateScheduleItemRequest,
  type UpdateScheduleItemRequest,
  type SwapCodesRequest,
  type SearchScheduleItemsParams,
} from '@/services/scheduleService';

// Query keys
export const scheduleItemKeys = {
  all: ['schedule-items'] as const,
  lists: () => [...scheduleItemKeys.all, 'list'] as const,
  list: (projectId: string, filters?: SearchScheduleItemsParams) =>
    [...scheduleItemKeys.lists(), projectId, filters] as const,
};

// Get schedule items for a project
export function useProjectItems(projectId: string | null, filters?: SearchScheduleItemsParams) {
  return useQuery({
    queryKey: scheduleItemKeys.list(projectId!, filters),
    queryFn: () => scheduleService.getItems(projectId!, filters),
    enabled: !!projectId,
  });
}

// Create schedule item mutation
export function useCreateScheduleItem(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateScheduleItemRequest) => scheduleService.createItem(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleItemKeys.lists() });
      toast.success('Schedule item added successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error || 'Failed to add schedule item';
      toast.error(message);
    },
  });
}

// Update schedule item mutation
export function useUpdateScheduleItem(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, data }: { itemId: string; data: UpdateScheduleItemRequest }) =>
      scheduleService.updateItem(projectId, itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleItemKeys.lists() });
      toast.success('Schedule item updated successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error || 'Failed to update schedule item';
      toast.error(message);
    },
  });
}

// Delete schedule item mutation
export function useDeleteScheduleItem(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => scheduleService.deleteItem(projectId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleItemKeys.lists() });
      toast.success('Schedule item deleted successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error || 'Failed to delete schedule item';
      toast.error(message);
    },
  });
}

// Swap codes mutation
export function useSwapCodes(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SwapCodesRequest) => scheduleService.swapCodes(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleItemKeys.lists() });
      toast.success('Codes swapped successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error || 'Failed to swap codes';
      toast.error(message);
    },
  });
}

