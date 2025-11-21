import axiosClient from '@/lib/axiosClient';

// Types based on smoke test logs and API routes
export interface ScheduleItemProduct {
  id: string;
  sku: string;
  name: string;
  internalCode: string;
  brand: {
    id: string;
    name: string;
  };
  category: {
    id: string;
    name: string;
  };
  subcategory: {
    id: string;
    name: string;
    prefix: string;
  };
}

export interface ScheduleItem {
  id: string;
  projectId: string;
  productId: string;
  code: string;
  area: string | null;
  locationNote: string | null;
  usageNote: string | null;
  sortOrder: number | null;
  createdAt: string;
  updatedAt: string;
  product: ScheduleItemProduct;
}

export interface CreateScheduleItemRequest {
  productId: string;
  code?: string;
  area?: string | null;
  locationNote?: string | null;
  usageNote?: string | null;
  sortOrder?: number | null;
}

export interface UpdateScheduleItemRequest {
  code?: string;
  area?: string | null;
  locationNote?: string | null;
  usageNote?: string | null;
  sortOrder?: number | null;
}

export interface ScheduleItemResponse {
  item: ScheduleItem;
}

export interface ScheduleItemsListResponse {
  items: ScheduleItem[];
}

export interface SwapCodesRequest {
  itemIdA: string;
  itemIdB: string;
}

export interface SwapCodesResponse {
  items: ScheduleItem[];
}

export interface SearchScheduleItemsParams {
  q?: string;
  brandId?: string;
  categoryId?: string;
  subcategoryId?: string;
}

export const scheduleService = {
  // Get schedule items for a project
  getItems: async (projectId: string, params?: SearchScheduleItemsParams): Promise<ScheduleItem[]> => {
    const searchParams = new URLSearchParams();
    if (params?.q) searchParams.append('q', params.q);
    if (params?.brandId) searchParams.append('brandId', params.brandId);
    if (params?.categoryId) searchParams.append('categoryId', params.categoryId);
    if (params?.subcategoryId) searchParams.append('subcategoryId', params.subcategoryId);

    const url = searchParams.toString()
      ? `/api/projects/${projectId}/items?${searchParams.toString()}`
      : `/api/projects/${projectId}/items`;
    const response = await axiosClient.get<ScheduleItemsListResponse>(url);
    return response.data.items;
  },

  // Create schedule item
  createItem: async (projectId: string, data: CreateScheduleItemRequest): Promise<ScheduleItem> => {
    const response = await axiosClient.post<ScheduleItemResponse>(
      `/api/projects/${projectId}/items`,
      data
    );
    return response.data.item;
  },

  // Update schedule item
  updateItem: async (
    projectId: string,
    itemId: string,
    data: UpdateScheduleItemRequest
  ): Promise<ScheduleItem> => {
    const response = await axiosClient.patch<ScheduleItemResponse>(
      `/api/projects/${projectId}/items/${itemId}`,
      data
    );
    return response.data.item;
  },

  // Delete schedule item
  deleteItem: async (projectId: string, itemId: string): Promise<void> => {
    await axiosClient.delete(`/api/projects/${projectId}/items/${itemId}`);
  },

  // Swap codes between two items
  swapCodes: async (projectId: string, data: SwapCodesRequest): Promise<ScheduleItem[]> => {
    const response = await axiosClient.post<SwapCodesResponse>(
      `/api/projects/${projectId}/items/swap-codes`,
      data
    );
    return response.data.items;
  },
};

