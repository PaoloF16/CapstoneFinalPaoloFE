// src/types/restaurant.ts

export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'WAITING';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
}

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface Table {
  id: string;
  number: number;
  capacity: number;
  status: TableStatus;
  currentOrder?: {
    id: string;
    items: OrderItem[];
    createdAt: string;
  };
}