import { useState, useEffect } from 'react';

interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  brandId: string;
  productTypeId: string;
  specifications?: any;
  images?: any;
  createdAt: string;
  updatedAt: string;
  brand: {
    id: string;
    name: string;
  };
  productType: {
    id: string;
    name: string;
  };
}

interface ProductFilters {
  search?: string;
  brandId?: string;
  productTypeId?: string;
  page?: number;
  limit?: number;
}

interface ProductResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useProducts(filters: ProductFilters = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async (newFilters?: ProductFilters) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      const filtersToUse = { ...filters, ...newFilters };
      
      if (filtersToUse.search) params.append('search', filtersToUse.search);
      if (filtersToUse.brandId) params.append('brandId', filtersToUse.brandId);
      if (filtersToUse.productTypeId) params.append('productTypeId', filtersToUse.productTypeId);
      if (filtersToUse.page) params.append('page', filtersToUse.page.toString());
      if (filtersToUse.limit) params.append('limit', filtersToUse.limit.toString());

      const response = await fetch(`/api/products?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data: ProductResponse = await response.json();
      setProducts(data.products);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (productData: {
    sku: string;
    name: string;
    description?: string;
    brandId: string;
    productTypeId: string;
    specifications?: any;
    images?: any;
  }) => {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create product');
      }

      const newProduct = await response.json();
      setProducts(prev => [newProduct, ...prev]);
      return newProduct;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    pagination,
    loading,
    error,
    refetch: fetchProducts,
    createProduct
  };
}