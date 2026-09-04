import axios from 'axios';
import type { User, Role, RoleFormData } from '../types/user';

const API_URL = 'http://localhost:8080/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const userService = {
  // --- USUARIOS ---
  getUsers: async (): Promise<User[]> => {
    const res = await axios.get(`${API_URL}/users`, { headers: getAuthHeaders() });
    return res.data;
  },

  createUser: async (userData: any): Promise<User> => {
    const res = await axios.post(`${API_URL}/users`, userData, { headers: getAuthHeaders() });
    return res.data;
  },

  updateUser: async (id: string, userData: any): Promise<User> => {
    const res = await axios.put(`${API_URL}/users/${id}`, userData, { headers: getAuthHeaders() });
    return res.data;
  },

  toggleUserStatus: async (id: string): Promise<User> => {
    const res = await axios.patch(`${API_URL}/users/${id}/toggle-status`, {}, { headers: getAuthHeaders() });
    return res.data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/users/${id}`, { headers: getAuthHeaders() });
  },

  // --- ROLES ---
  getRoles: async (): Promise<Role[]> => {
    const res = await axios.get(`${API_URL}/roles`, { headers: getAuthHeaders() });
    return res.data;
  },

  createRole: async (roleData: RoleFormData): Promise<Role> => {
    const res = await axios.post(`${API_URL}/roles`, roleData, { headers: getAuthHeaders() });
    return res.data;
  },

  updateRole: async (id: string, roleData: RoleFormData): Promise<Role> => {
    const res = await axios.put(`${API_URL}/roles/${id}`, roleData, { headers: getAuthHeaders() });
    return res.data;
  },

  deleteRole: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/roles/${id}`, { headers: getAuthHeaders() });
  },
};