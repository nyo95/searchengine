import axiosClient from '@/lib/axiosClient'

export interface Subcategory {
  id: string
  name: string
  prefix: string
  categoryId?: string | null
  defaultAttributesTemplate: any
}

export interface SubcategoryResponse {
  subcategory: Subcategory
}

export interface SubcategoriesListResponse {
  subcategories: Subcategory[]
}

export const subcategoryService = {
  getAll: async (): Promise<Subcategory[]> => {
    const response = await axiosClient.get<SubcategoriesListResponse>('/api/subcategories')
    return response.data.subcategories
  },

  getById: async (id: string): Promise<Subcategory> => {
    const response = await axiosClient.get<SubcategoryResponse>(`/api/subcategories/${id}`)
    return response.data.subcategory
  },

  create: async (data: Partial<Subcategory>): Promise<Subcategory> => {
    const response = await axiosClient.post<SubcategoryResponse>('/api/subcategories', data)
    return response.data.subcategory
  },

  update: async (id: string, data: Partial<Subcategory>): Promise<Subcategory> => {
    const response = await axiosClient.patch<SubcategoryResponse>(`/api/subcategories/${id}`, data)
    return response.data.subcategory
  },

  delete: async (id: string): Promise<void> => {
    await axiosClient.delete(`/api/subcategories/${id}`)
  },
}
