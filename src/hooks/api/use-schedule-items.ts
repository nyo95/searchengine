import { useState, useEffect } from 'react';

interface ScheduleItem {
  id: string;
  code: string;
  description?: string;
  quantity?: number;
  unit?: string;
  notes?: string;
  productId?: string;
  scheduleId: string;
  source: string;
  attributes?: any;
  createdAt: string;
  updatedAt: string;
  product?: {
    id: string;
    sku: string;
    name: string;
    brand: {
      id: string;
      name: string;
    };
    productType: {
      id: string;
      name: string;
    };
  };
}

interface ScheduleItemsResponse {
  scheduleItems: ScheduleItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useScheduleItems(scheduleId: string, page = 1, limit = 50) {
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchScheduleItems = async (newPage?: number) => {
    if (!scheduleId) return;

    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('scheduleId', scheduleId);
      params.append('page', (newPage || page).toString());
      params.append('limit', limit.toString());

      const response = await fetch(`/api/schedule-items?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch schedule items');
      }
      
      const data: ScheduleItemsResponse = await response.json();
      setScheduleItems(data.scheduleItems);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const createScheduleItem = async (itemData: {
    code: string;
    description?: string;
    quantity?: number;
    unit?: string;
    notes?: string;
    productId?: string;
    scheduleId: string;
    source?: string;
    attributes?: any;
  }) => {
    try {
      const response = await fetch('/api/schedule-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create schedule item');
      }

      const newItem = await response.json();
      setScheduleItems(prev => [...prev, newItem]);
      return newItem;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const updateScheduleItem = async (id: string, updates: Partial<ScheduleItem>) => {
    try {
      const response = await fetch(`/api/schedule-items/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update schedule item');
      }

      const updatedItem = await response.json();
      setScheduleItems(prev => 
        prev.map(item => item.id === id ? updatedItem : item)
      );
      return updatedItem;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  useEffect(() => {
    fetchScheduleItems();
  }, [scheduleId]);

  return {
    scheduleItems,
    pagination,
    loading,
    error,
    refetch: fetchScheduleItems,
    createScheduleItem,
    updateScheduleItem
  };
}