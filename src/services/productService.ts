import axiosClient from '@/lib/axiosClient';

// Types based on smoke test logs and API routes
export interface ProductBrand {
  id: string;
  name: string;
}

export interface ProductCategory {
  id: string;
  name: string;
}

export interface ProductSubcategory {
  id: string;
  name: string;
  prefix: string | null;
}

export interface Product {
  id: string;
  brandId: string;
  categoryId: string;
  subcategoryId: string;
  sku: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  internalCode: string;
  brand: ProductBrand;
  category: ProductCategory | null;
  subcategory: ProductSubcategory | null;
  dynamicAttributes: Record<string, unknown> | null;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  sku: string;
  name: string;
  brandId: string;
  categoryName: string;
  subcategoryName: string;
  description?: string;
  imageUrl?: string;
  dynamicAttributes?: Record<string, unknown>;
  isActive?: boolean;
  tags?: string[];
}

export interface UpdateProductRequest {
  name?: string;
  sku?: string;
  description?: string;
  imageUrl?: string;
  dynamicAttributes?: Record<string, unknown>;
  isActive?: boolean;
}

export interface ProductResponse {
  product: Product;
}

export interface SearchProductsParams {
  q?: string;
  brandId?: string;
  categoryId?: string;
  subcategoryId?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

export interface SearchProductsResponse {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface SearchSuggestion {
  code: string;
  name: string;
  brandName: string | null;
}

export interface SearchSuggestionsResponse {
  suggestions: SearchSuggestion[];
}

export interface CatalogMeta {
  categories: Array<{
    id: string;
    name: string;
    nameEn: string | null;
    productsCount: number;
  }>;
  brands: Array<{
    id: string;
    name: string;
    website: string | null;
    phone: string | null;
    productsCount: number;
  }>;
}

export interface CatalogMetaResponse {
  categories: CatalogMeta['categories'];
  brands: CatalogMeta['brands'];
}

export const productService = {
  // Create product
  create: async (data: CreateProductRequest): Promise<Product> => {
    const response = await axiosClient.post<ProductResponse>('/api/products', data);
    return response.data.product;
  },

  // Get product by ID
  getById: async (id: string): Promise<Product> => {
    const response = await axiosClient.get<ProductResponse>(`/api/products/${id}`);
    return response.data.product;
  },

  // Update product (supports partial update)
  update: async (id: string, data: UpdateProductRequest): Promise<Product> => {
    const response = await axiosClient.patch<ProductResponse>(`/api/products/${id}`, data);
    return response.data.product;
  },

  // Deactivate product (convenience method)
  deactivate: async (id: string): Promise<Product> => {
    return productService.update(id, { isActive: false });
  },

  // Search products
  search: async (params: SearchProductsParams): Promise<SearchProductsResponse> => {
    const searchParams = new URLSearchParams();
    if (params.q) searchParams.append('q', params.q);
    if (params.brandId) searchParams.append('brandId', params.brandId);
    if (params.categoryId) searchParams.append('categoryId', params.categoryId);
    if (params.subcategoryId) searchParams.append('subcategoryId', params.subcategoryId);
    if (params.isActive !== undefined) searchParams.append('isActive', String(params.isActive));
    if (params.page) searchParams.append('page', String(params.page));
    if (params.pageSize) searchParams.append('pageSize', String(params.pageSize));

    const response = await axiosClient.get<SearchProductsResponse>(
      `/api/search/products?${searchParams.toString()}`
    );
    return response.data;
  },

  // Get search suggestions
  getSuggestions: async (q: string, limit?: number): Promise<SearchSuggestion[]> => {
    const searchParams = new URLSearchParams({ q });
    if (limit) searchParams.append('limit', String(limit));

    const response = await axiosClient.get<SearchSuggestionsResponse>(
      `/api/search/suggestions?${searchParams.toString()}`
    );
    return response.data.suggestions;
  },

  // Get catalog metadata (categories and brands)
  getCatalogMeta: async (): Promise<CatalogMeta> => {
    const response = await axiosClient.get<CatalogMetaResponse>('/api/catalog/meta');
    return {
      categories: response.data.categories,
      brands: response.data.brands,
    };
  },
};

