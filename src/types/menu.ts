// src/types/menu.ts
export interface Category {
  id: string;
  name: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  categoryId: string;
  imageUrl: string;
  isAvailable: boolean;
  isGlutenFree?: boolean;
  isNew?: boolean;
  discountBadge?: string;
}

export type MenuItemFormData = Omit<MenuItem, 'id'>;