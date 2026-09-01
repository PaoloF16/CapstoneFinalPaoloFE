// src/context/AuthContext.tsx
import React, { createContext, useContext, useState } from 'react';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions?: string[];
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, userData: UserProfile) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('user_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const login = (newToken: string, userData: UserProfile) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user_data', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_data');
    setToken(null);
    setUser(null);
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    const roleUpper = String(user.role || '').toUpperCase();
    if (roleUpper.includes('ADMIN') || roleUpper === '') return true;

    const userPerms = Array.isArray(user.permissions) ? user.permissions : [];
    return userPerms.includes(permission);
  };

  const hasAnyRole = (roles: string[]): boolean => {
    if (!user) return false;
    const roleUpper = String(user.role || '').toUpperCase();
    if (roleUpper.includes('ADMIN') || roleUpper === '') return true;

    const normalizedRoles = roles.map((r) => r.toUpperCase());
    return normalizedRoles.includes(roleUpper);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        login,
        logout,
        hasPermission,
        hasAnyRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};