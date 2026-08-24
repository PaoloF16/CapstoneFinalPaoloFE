// src/services/restaurantService.ts
import api from './api';
import type { 
  RestaurantTable, 
  Order, 
  CreateOrderDTO, 
  OrderItemRequest, 
  CheckoutDTO, 
  TableStatus 
} from '../types/restaurant';

// --- SERVICIOS DE MESAS ---

export const getTables = async (): Promise<RestaurantTable[]> => {
  const response = await api.get<RestaurantTable[]>('/tables');
  return response.data || [];
};

export const createTable = async (tableData: Partial<RestaurantTable>): Promise<RestaurantTable> => {
  const response = await api.post<RestaurantTable>('/tables', tableData);
  return response.data;
};

export const updateTable = async (tableId: string, tableData: Partial<RestaurantTable>): Promise<RestaurantTable> => {
  const response = await api.put<RestaurantTable>(`/tables/${tableId}`, tableData);
  return response.data;
};

export const updateTableStatus = async (tableId: string, status: TableStatus): Promise<RestaurantTable> => {
  const response = await api.put<RestaurantTable>(`/tables/${tableId}/status`, { status });
  return response.data;
};

export const deleteTable = async (tableId: string): Promise<void> => {
  await api.delete(`/tables/${tableId}`);
};

// --- SERVICIOS DE PEDIDOS Y CHECKOUT ---

export const createOrder = async (orderData: CreateOrderDTO): Promise<Order> => {
  const response = await api.post<Order>('/orders', orderData);
  return response.data;
};

export const getActiveOrderByTable = async (tableId: string): Promise<Order> => {
  const response = await api.get<Order>(`/orders/table/${tableId}`);
  return response.data;
};

export const updateOrderItems = async (orderId: string, items: OrderItemRequest[]): Promise<Order> => {
  const response = await api.put<Order>(`/orders/${orderId}/items`, items);
  return response.data;
};

export const checkoutOrder = async (orderId: string, checkoutData: CheckoutDTO): Promise<Order> => {
  const response = await api.post<Order>(`/orders/${orderId}/checkout`, checkoutData);
  return response.data;
};
// Agregar en src/services/restaurantService.ts si deseas actualizar estado directo:
export const sendOrderToKitchen = async (orderId: string): Promise<Order> => {
  const response = await api.put<Order>(`/orders/${orderId}/items`);
  return response.data;
};