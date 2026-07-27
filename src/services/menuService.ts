// src/services/menuService.ts

// 1. Importación por defecto del cliente HTTP
import api from './api';

// 2. Importación exclusiva de tipos TypeScript
import type { MenuItem, Category, MenuItemFormData } from '../types/menu';

export const menuService = {
  getProducts: async (categoryId?: string): Promise<MenuItem[]> => {
    try {
      const response = await api.get<MenuItem[]>('/products', {
        params: { categoryId },
      });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  },

  getCategories: async (): Promise<Category[]> => {
    try {
      const response = await api.get<Category[]>('/categories');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  createProduct: async (data: MenuItemFormData): Promise<MenuItem> => {
    const response = await api.post<MenuItem>('/products', data);
    return response.data;
  },

  updateProduct: async (id: string, data: Partial<MenuItemFormData>): Promise<MenuItem> => {
    const response = await api.put<MenuItem>(`/products/${id}`, data);
    return response.data;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },

  toggleAvailability: async (id: string, isAvailable: boolean): Promise<MenuItem> => {
    const response = await api.patch<MenuItem>(`/products/${id}/availability`, { isAvailable });
    return response.data;
  },
};