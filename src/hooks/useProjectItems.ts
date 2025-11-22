import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  scheduleService,
  type CreateScheduleItemRequest,
  type UpdateScheduleItemRequest,
  type SwapCodesRequest,
} from '@/services/scheduleService'

export const scheduleItemKeys = {
  all: ['schedule-items'] as const,
  lists: () => [...scheduleItemKeys.all, 'list'] as const,
  list: (projectId: string) => [...scheduleItemKeys.lists(), projectId] as const,
}

export function useProjectItems(projectId: string | null) {
  return useQuery({
    queryKey: scheduleItemKeys.list(projectId!),
    queryFn: () => scheduleService.getItems(projectId!),
    enabled: !!projectId,
  })
}

export function useCreateScheduleItem(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateScheduleItemRequest) => scheduleService.createItem(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleItemKeys.lists() })
      toast.success('Schedule item added successfully')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error || 'Failed to add schedule item'
      toast.error(message)
    },
  })
}

export function useUpdateScheduleItem(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ itemId, data }: { itemId: string; data: UpdateScheduleItemRequest }) =>
      scheduleService.updateItem(projectId, itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleItemKeys.lists() })
      toast.success('Schedule item updated successfully')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error || 'Failed to update schedule item'
      toast.error(message)
    },
  })
}

export function useDeleteScheduleItem(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (itemId: string) => scheduleService.deleteItem(projectId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleItemKeys.lists() })
      toast.success('Schedule item deleted successfully')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error || 'Failed to delete schedule item'
      toast.error(message)
    },
  })
}

export function useSwapCodes(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SwapCodesRequest) => scheduleService.swapCodes(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleItemKeys.lists() })
      toast.success('Codes swapped successfully')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error || 'Failed to swap codes'
      toast.error(message)
    },
  })
}
