import { useState, useEffect } from 'react';

interface ProductType {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export function useProductTypes() {
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProductTypes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/product-types');
      
      if (!response.ok) {
        throw new Error('Failed to fetch product types');
      }
      
      const data = await response.json();
      setProductTypes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const createProductType = async (productTypeData: { name: string; description?: string }) => {
    try {
      const response = await fetch('/api/product-types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productTypeData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create product type');
      }

      const newProductType = await response.json();
      setProductTypes(prev => [...prev, newProductType]);
      return newProductType;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  useEffect(() => {
    fetchProductTypes();
  }, []);

  return {
    productTypes,
    loading,
    error,
    refetch: fetchProductTypes,
    createProductType
  };
}