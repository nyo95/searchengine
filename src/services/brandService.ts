import axiosClient from '@/lib/axiosClient';

// Types based on smoke test logs
export interface Brand {
  id: string;
  name: string;
  website: string;
  phone: string;
  salesName: string;
  salesContact: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBrandRequest {
  name: string;
  website: string;
  phone: string;
  salesName: string;
  salesContact: string;
}

export interface UpdateBrandRequest {
  name?: string;
  website?: string;
  phone?: string;
  salesName?: string;
  salesContact?: string;
  isActive?: boolean;
}

export interface BrandResponse {
  brand: Brand;
}

export interface BrandsListResponse {
  brands: Brand[];
}

export const brandService = {
  // Create brand
  create: async (data: CreateBrandRequest): Promise<Brand> => {
    const response = await axiosClient.post<BrandResponse>('/api/brands', data);
    return response.data.brand;
  },

  // Get all active brands
  getAll: async (): Promise<Brand[]> => {
    const response = await axiosClient.get<BrandsListResponse>('/api/brands');
    return response.data.brands;
  },

  // Get brand by ID
  getById: async (id: string): Promise<Brand> => {
    const response = await axiosClient.get<BrandResponse>(`/api/brands/${id}`);
    return response.data.brand;
  },

  // Update brand (supports partial update including soft delete via isActive)
  update: async (id: string, data: UpdateBrandRequest): Promise<Brand> => {
    const response = await axiosClient.patch<BrandResponse>(`/api/brands/${id}`, data);
    return response.data.brand;
  },

  // Soft delete brand (convenience method)
  softDelete: async (id: string): Promise<Brand> => {
    return brandService.update(id, { isActive: false });
  },

  // Restore brand (convenience method)
  restore: async (id: string): Promise<Brand> => {
    return brandService.update(id, { isActive: true });
  },
};

