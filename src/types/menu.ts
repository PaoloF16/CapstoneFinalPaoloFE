// src/types/menu.ts

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  categoryId: string;
  category?: Category;
  imageUrl?: string;
  isAvailable: boolean;
  isGlutenFree?: boolean;
  isNew?: boolean;
  discountBadge?: string;
}

export interface MenuItemFormData {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  categoryId: string;
  imageUrl?: string;
  isAvailable: boolean;
  isGlutenFree?: boolean;
  isNew?: boolean;
  discountBadge?: string;
}

export interface CategoryFormData {
  name: string;
  description?: string;
}
