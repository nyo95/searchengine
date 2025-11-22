import axiosClient from '@/lib/axiosClient'

export interface ProductBrand {
  id: string
  name: string
}

export interface ProductSubcategory {
  id: string
  name: string
  prefix: string
}

export interface Product {
  id: string
  name: string
  skuOrType: string
  brandId: string
  subcategoryId: string
  attributesData: Record<string, unknown> | null
  brand: ProductBrand
  subcategory: ProductSubcategory
  createdAt: string
  updatedAt: string
}

export interface CreateProductRequest {
  name: string
  skuOrType: string
  brandId: string
  subcategoryId: string
  attributesData?: Record<string, unknown>
}

export interface UpdateProductRequest {
  name?: string
  skuOrType?: string
  brandId?: string
  subcategoryId?: string
  attributesData?: Record<string, unknown> | null
}

export interface ProductResponse {
  product: Product
}

export interface ProductsListResponse {
  products: Product[]
}

export interface SearchProductsParams {
  search?: string
  brandId?: string
  subcategoryId?: string
}

export const productService = {
  create: async (data: CreateProductRequest): Promise<Product> => {
    const response = await axiosClient.post<ProductResponse>('/api/products', data)
    return response.data.product
  },

  getById: async (id: string): Promise<Product> => {
    const response = await axiosClient.get<ProductResponse>(`/api/products/${id}`)
    return response.data.product
  },

  update: async (id: string, data: UpdateProductRequest): Promise<Product> => {
    const response = await axiosClient.patch<ProductResponse>(`/api/products/${id}`, data)
    return response.data.product
  },

  delete: async (id: string): Promise<void> => {
    await axiosClient.delete(`/api/products/${id}`)
  },

  search: async (params: SearchProductsParams = {}): Promise<Product[]> => {
    const searchParams = new URLSearchParams()
    if (params.search) searchParams.append('search', params.search)
    if (params.brandId) searchParams.append('brandId', params.brandId)
    if (params.subcategoryId) searchParams.append('subcategoryId', params.subcategoryId)

    const url = searchParams.toString() ? `/api/products?${searchParams.toString()}` : '/api/products'
    const response = await axiosClient.get<ProductsListResponse>(url)
    return response.data.products
  },
}
