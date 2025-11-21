import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  // Theme
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;

  // Filters
  brandFilter: string | null;
  setBrandFilter: (brandId: string | null) => void;

  categoryFilter: string | null;
  setCategoryFilter: (categoryId: string | null) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),

      brandFilter: null,
      setBrandFilter: (brandId) => set({ brandFilter: brandId }),

      categoryFilter: null,
      setCategoryFilter: (categoryId) => set({ categoryFilter: categoryId }),

      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),

      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: 'ui-preferences',
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);

