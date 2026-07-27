// src/services/menuService.ts
import { apiClient } from './api';
import type { MenuItem, Category, MenuItemFormData } from '../types/menu';

export const menuService = {
  getProducts: async (categoryId?: string): Promise<MenuItem[]> => {
    try {
      const response = await apiClient.get<MenuItem[]>('/products', {
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
      const response = await apiClient.get<Category[]>('/categories');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  createProduct: async (data: MenuItemFormData): Promise<MenuItem> => {
    const response = await apiClient.post<MenuItem>('/products', data);
    return response.data;
  },

  updateProduct: async (id: string, data: Partial<MenuItemFormData>): Promise<MenuItem> => {
    const response = await apiClient.put<MenuItem>(`/products/${id}`, data);
    return response.data;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },

  toggleAvailability: async (id: string, isAvailable: boolean): Promise<MenuItem> => {
    const response = await apiClient.patch<MenuItem>(`/products/${id}/availability`, { isAvailable });
    return response.data;
  },
};