// src/types/restaurant.ts

export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'WAITING';
export type OrderStatus = 'PENDING' | 'IN_PREPARATION' | 'READY' | 'DELIVERED' | 'PAID';

export interface RestaurantTable {
  id: string;
  tableNumber: number;
  capacity: number;
  status: TableStatus;
  imageUrl?: string;
}

export interface OrderItem {
  id?: string;
  product: {
    id: string;
    name: string;
    price: number;
    isGlutenFree?: boolean;
    description?: string;
    imageUrl?: string;
  };
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  table: RestaurantTable;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  discountType?: 'PERCENTAGE' | 'FIXED' | 'NONE';
  total: number;
  items: OrderItem[];
  createdAt: string;
}

// DTOs para peticiones
export interface OrderItemRequest {
  productId: string;
  quantity: number;
}

export interface CreateOrderDTO {
  tableId: string;
  items: OrderItemRequest[];
}

export interface CheckoutDTO {
  discountValue?: number;
  discountType?: 'PERCENTAGE' | 'FIXED';
}
export interface ProductItem {
  id: string;
  name: string;
  price: number;
}
