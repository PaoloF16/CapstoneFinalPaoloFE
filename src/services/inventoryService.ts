// src/services/inventoryService.ts
import api from './api';

export interface Ingredient {
  id?: string;
  name: string;
  stockQuantity: number;
  unit: string;
  minStockWarning?: number;
}

export const inventoryService = {
  getIngredients: async (): Promise<Ingredient[]> => {
    const response = await api.get<Ingredient[]>('/ingredients');
    return response.data || [];
  },

  createIngredient: async (data: Ingredient): Promise<Ingredient> => {
    const response = await api.post<Ingredient>('/ingredients', data);
    return response.data;
  },

  updateIngredient: async (id: string, data: Ingredient): Promise<Ingredient> => {
    const response = await api.put<Ingredient>(`/ingredients/${id}`, data);
    return response.data;
  },

  deleteIngredient: async (id: string): Promise<void> => {
    await api.delete(`/ingredients/${id}`);
  },
};