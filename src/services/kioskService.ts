import axios from 'axios';
import type { Category, MenuItem } from '../types/menu';
import type { RestaurantTable, Order } from '../types/restaurant';

const API_URL = 'http://localhost:8080/api';

export interface SelfOrderPayload {
  orderType: 'DINE_IN' | 'TAKEAWAY';
  tableId?: string;
  customerName?: string;
  paymentMethod: 'TARJETA' | 'YAPE_PLIN' | 'EFECTIVO';
  items: { productId: string; quantity: number }[];
}

export const kioskService = {
  // Obtener catálogo público de platos y categorías
  getPublicMenu: async (): Promise<{ categories: Category[]; products: MenuItem[] }> => {
    const [catsRes, prodsRes] = await Promise.all([
      axios.get(`${API_URL}/categories`),
      axios.get(`${API_URL}/products`),
    ]);

    const availableProducts = (prodsRes.data as MenuItem[]).filter((p) => p.isAvailable);
    return {
      categories: catsRes.data,
      products: availableProducts,
    };
  },

  // Obtener mesas físicas disponibles
  getPublicTables: async (): Promise<RestaurantTable[]> => {
    try {
      const res = await axios.get(`${API_URL}/tables`);
      return (res.data as RestaurantTable[]).filter((t) => t.tableNumber !== 999);
    } catch {
      return [];
    }
  },

  // Enviar pedido pagado a cocina
  submitSelfOrder: async (payload: SelfOrderPayload): Promise<Order> => {
    const res = await axios.post(`${API_URL}/orders/self-order`, payload);
    return res.data;
  },
};