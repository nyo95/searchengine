import axiosClient from '@/lib/axiosClient'

export interface Brand {
  id: string
  name: string
  salesContactName: string
  salesContactPhone: string
  createdAt: string
  updatedAt: string
}

export interface CreateBrandRequest {
  name: string
  salesContactName: string
  salesContactPhone: string
}

export interface UpdateBrandRequest {
  name?: string
  salesContactName?: string
  salesContactPhone?: string
}

export interface BrandResponse {
  brand: Brand
}

export interface BrandsListResponse {
  brands: Brand[]
}

export const brandService = {
  create: async (data: CreateBrandRequest): Promise<Brand> => {
    const response = await axiosClient.post<BrandResponse>('/api/brands', data)
    return response.data.brand
  },

  getAll: async (search?: string): Promise<Brand[]> => {
    const url = search ? `/api/brands?search=${encodeURIComponent(search)}` : '/api/brands'
    const response = await axiosClient.get<BrandsListResponse>(url)
    return response.data.brands
  },

  getById: async (id: string): Promise<Brand> => {
    const response = await axiosClient.get<BrandResponse>(`/api/brands/${id}`)
    return response.data.brand
  },

  update: async (id: string, data: UpdateBrandRequest): Promise<Brand> => {
    const response = await axiosClient.patch<BrandResponse>(`/api/brands/${id}`, data)
    return response.data.brand
  },

  delete: async (id: string): Promise<void> => {
    await axiosClient.delete(`/api/brands/${id}`)
  },
}
