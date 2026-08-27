// src/services/reportService.ts
import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface AnalyticsData {
  todayTotal: number;
  weekTotal: number;
  monthTotal: number;
  yearTotal: number;
  totalPaidOrders: number;
  averageTicket: number;
  isRegisterClosed: boolean;
  initialCash: number;
  topProducts: {
    name: string;
    quantity: number;
    totalRevenue: number;
  }[];
  last7Days: {
    date: string;
    dayName: string;
    total: number;
    orderCount: number;
  }[];
  todayOrdersList: {
    id: string;
    tableNumber: number;
    total: number;
    time: string;
    paymentMethod: string;
  }[];
  monthWeeks: {
    label: string;
    total: number;
    orderCount: number;
  }[];
  yearMonths: {
    monthName: string;
    monthNumber: number;
    total: number;
    orderCount: number;
  }[];
}

export const reportService = {
  getAnalytics: async (): Promise<AnalyticsData> => {
    const res = await axios.get(`${API_URL}/reports/analytics`, { headers: getAuthHeaders() });
    return res.data;
  },

  closeRegister: async (data: { initialCash: number; countedCash: number; notes?: string }) => {
    const res = await axios.post(`${API_URL}/reports/close-register`, data, { headers: getAuthHeaders() });
    return res.data;
  },

  openNewDay: async (data: { initialCash: number }) => {
    const res = await axios.post(`${API_URL}/reports/open-new-day`, data, { headers: getAuthHeaders() });
    return res.data;
  },
};