// ==========================================
// TIPOS E INTERFACES PARA USUARIOS Y ROLES
// ==========================================

export interface Role {
  id: string;
  name: string;
  description?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  posPin: string;
  active: boolean;
  role: Role | null;
}

export interface UserFormData {
  name: string;
  email: string;
  posPin: string;
  roleId: string;
}

export interface RoleFormData {
  name: string;
  description?: string;
}