// src/services/userService.ts
import api from './api';
import type { User, Role, UserFormData, RoleFormData } from '../types/user';

export const userService = {
  // ROLES
  getRoles: async (): Promise<Role[]> => {
    const response = await api.get<Role[]>('/roles');
    return response.data || [];
  },

  createRole: async (data: RoleFormData): Promise<Role> => {
    const response = await api.post<Role>('/roles', data);
    return response.data;
  },

  updateRole: async (id: string, data: Partial<RoleFormData>): Promise<Role> => {
    const response = await api.put<Role>(`/roles/${id}`, data);
    return response.data;
  },

  deleteRole: async (id: string): Promise<void> => {
    await api.delete(`/roles/${id}`);
  },

  // USUARIOS
  getUsers: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/users');
    return response.data || [];
  },

  createUser: async (data: UserFormData): Promise<User> => {
    const payload = {
      name: data.name,
      email: data.email,
      posPin: data.posPin,
      role: data.roleId ? { id: data.roleId } : null
    };
    const response = await api.post<User>('/users', payload);
    return response.data;
  },

  updateUser: async (id: string, data: Partial<UserFormData>): Promise<User> => {
    const payload = {
      name: data.name,
      posPin: data.posPin,
      role: data.roleId ? { id: data.roleId } : null
    };
    const response = await api.put<User>(`/users/${id}`, payload);
    return response.data;
  },

  toggleUserStatus: async (id: string): Promise<User> => {
    const response = await api.patch<User>(`/users/${id}/toggle-status`);
    return response.data;
  }
};