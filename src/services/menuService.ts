// src/services/menuService.ts
import api from './api';
import type { MenuItem, Category, MenuItemFormData, CategoryFormData } from '../types/menu';

export const menuService = {
  // --- PRODUCTOS ---
  getProducts: async (categoryId?: string): Promise<MenuItem[]> => {
    try {
      const response = await api.get<MenuItem[]>('/products', {
        params: { categoryId },
      });
      return response.data || [];
    } catch (error) {
      console.error('Error al obtener productos:', error);
      return [];
    }
  },

  createProduct: async (data: MenuItemFormData): Promise<MenuItem> => {
    const payload = {
      name: data.name,
      description: data.description || '',
      price: Number(data.price),
      originalPrice: data.originalPrice ? Number(data.originalPrice) : null,
      imageUrl: data.imageUrl || '',
      isAvailable: data.isAvailable ?? true,
      isGlutenFree: data.isGlutenFree ?? false,
      isNew: data.isNew ?? false,
      discountBadge: data.discountBadge || '',
      categoryId: data.categoryId,
      category: { id: data.categoryId }, // Soporta mapeo directo de Entidad @ManyToOne
    };

    const response = await api.post<MenuItem>('/products', payload);
    return response.data;
  },

  updateProduct: async (id: string, data: Partial<MenuItemFormData>): Promise<MenuItem> => {
    const payload = {
      ...data,
      ...(data.price ? { price: Number(data.price) } : {}),
      ...(data.categoryId
        ? { categoryId: data.categoryId, category: { id: data.categoryId } }
        : {}),
    };
    const response = await api.put<MenuItem>(`/products/${id}`, payload);
    return response.data;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },

  toggleAvailability: async (id: string, isAvailable: boolean): Promise<MenuItem> => {
    const response = await api.patch<MenuItem>(`/products/${id}/availability`, { isAvailable });
    return response.data;
  },

  // --- CATEGORÍAS ---
  getCategories: async (): Promise<Category[]> => {
    try {
      const response = await api.get<Category[]>('/categories');
      return response.data || [];
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      return [];
    }
  },

  createCategory: async (data: CategoryFormData): Promise<Category> => {
    const response = await api.post<Category>('/categories', data);
    return response.data;
  },

  updateCategory: async (id: string, data: CategoryFormData): Promise<Category> => {
    const response = await api.put<Category>(`/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};