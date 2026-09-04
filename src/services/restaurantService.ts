import axios from 'axios';
import type { RestaurantTable, Order, OrderStatus } from '../types/restaurant';

const API_URL = 'http://localhost:8080/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// --- MESAS ---
export const getTables = async (): Promise<RestaurantTable[]> => {
  const res = await axios.get(`${API_URL}/tables`, { headers: getAuthHeaders() });
  return res.data;
};

export const createTable = async (tableData: Partial<RestaurantTable>): Promise<RestaurantTable> => {
  const res = await axios.post(`${API_URL}/tables`, tableData, { headers: getAuthHeaders() });
  return res.data;
};

export const updateTable = async (id: string, tableData: Partial<RestaurantTable>): Promise<RestaurantTable> => {
  const res = await axios.put(`${API_URL}/tables/${id}`, tableData, { headers: getAuthHeaders() });
  return res.data;
};

export const deleteTable = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/tables/${id}`, { headers: getAuthHeaders() });
};

// --- COMANDAS Y COCINA ---
export const createOrder = async (orderData: { tableId: string; items: { productId: string; quantity: number }[] }): Promise<Order> => {
  const res = await axios.post(`${API_URL}/orders`, orderData, { headers: getAuthHeaders() });
  return res.data;
};

export const getKitchenOrders = async (): Promise<Order[]> => {
  const res = await axios.get(`${API_URL}/orders/kitchen`, { headers: getAuthHeaders() });
  return res.data;
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<Order> => {
  const res = await axios.patch(`${API_URL}/orders/${orderId}/status`, { status }, { headers: getAuthHeaders() });
  return res.data;
};

// --- OBTENER PLATOS ACTIVOS DE LA MESA ---
export const getActiveOrdersByTable = async (tableId: string): Promise<Order[]> => {
  try {
    const res = await axios.get(`${API_URL}/orders/table/${tableId}`, { headers: getAuthHeaders() });
    if (!res.data) return [];
    if (Array.isArray(res.data)) return res.data;
    if (res.data.items) return [res.data];
    return [];
  } catch (err) {
    console.error('Error al recuperar pedidos de mesa:', err);
    return [];
  }
};

// --- COBRAR Y LIBERAR MESA ---
export const checkoutTable = async (
  table: RestaurantTable,
  paymentMethod: string = 'EFECTIVO'
): Promise<void> => {
  try {
    // 1. Endpoint principal: liquida las órdenes activas y libera la mesa en Spring Boot
    await axios.post(
      `${API_URL}/orders/${table.id}/checkout`,
      { paymentMethod },
      { headers: getAuthHeaders() }
    );
  } catch (error) {
    // 2. Fallback de liberación de mesa directa si no hubiese órdenes activas
    await axios.put(
      `${API_URL}/tables/${table.id}/status`,
      { status: 'AVAILABLE' },
      { headers: getAuthHeaders() }
    );
  }
};

export const checkoutOrder = async (orderId: string, paymentData?: any): Promise<void> => {
  await axios.post(`${API_URL}/orders/${orderId}/checkout`, paymentData || {}, { headers: getAuthHeaders() });
};