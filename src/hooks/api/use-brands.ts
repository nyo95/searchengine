import { useState, useEffect } from 'react';

interface Brand {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export function useBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/brands');
      
      if (!response.ok) {
        throw new Error('Failed to fetch brands');
      }
      
      const data = await response.json();
      setBrands(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const createBrand = async (brandData: { name: string; description?: string }) => {
    try {
      const response = await fetch('/api/brands', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(brandData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create brand');
      }

      const newBrand = await response.json();
      setBrands(prev => [...prev, newBrand]);
      return newBrand;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  return {
    brands,
    loading,
    error,
    refetch: fetchBrands,
    createBrand
  };
}