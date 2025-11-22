import axiosClient from '@/lib/axiosClient'

export interface ScheduleItemProduct {
  id: string
  name: string
  skuOrType: string
  brand: { id: string; name: string }
  subcategory: { id: string; name: string; prefix: string }
}

export interface ScheduleItem {
  id: string
  projectId: string
  productId: string
  code: string
  quantity: number | null
  notes: string | null
  createdAt: string
  updatedAt: string
  product: ScheduleItemProduct
}

export interface CreateScheduleItemRequest {
  productId: string
  quantity?: number | null
  notes?: string | null
}

export interface UpdateScheduleItemRequest {
  quantity?: number | null
  notes?: string | null
}

export interface ScheduleItemResponse {
  item: ScheduleItem
}

export interface ScheduleItemsListResponse {
  items: ScheduleItem[]
}

export interface SwapCodesRequest {
  itemIdA: string
  itemIdB: string
}

export const scheduleService = {
  getItems: async (projectId: string): Promise<ScheduleItem[]> => {
    const response = await axiosClient.get<ScheduleItemsListResponse>(`/api/projects/${projectId}/schedule`)
    return response.data.items
  },

  createItem: async (projectId: string, data: CreateScheduleItemRequest): Promise<ScheduleItem> => {
    const response = await axiosClient.post<ScheduleItemResponse>(`/api/projects/${projectId}/schedule`, data)
    return response.data.item
  },

  updateItem: async (
    projectId: string,
    itemId: string,
    data: UpdateScheduleItemRequest,
  ): Promise<ScheduleItem> => {
    const response = await axiosClient.patch<ScheduleItemResponse>(
      `/api/projects/${projectId}/schedule/${itemId}`,
      data,
    )
    return response.data.item
  },

  deleteItem: async (projectId: string, itemId: string): Promise<void> => {
    await axiosClient.delete(`/api/projects/${projectId}/schedule/${itemId}`)
  },

  swapCodes: async (projectId: string, data: SwapCodesRequest): Promise<void> => {
    await axiosClient.post(`/api/projects/${projectId}/schedule/swap-codes`, data)
  },
}
