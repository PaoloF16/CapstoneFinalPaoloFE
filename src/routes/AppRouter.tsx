// src/routes/AppRouter.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { useAuth } from '../context/AuthContext';

// Páginas Públicas
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { MobileLoginPage } from '../pages/mobile/MobileLoginPage';

// Páginas del Sistema
import { TablesDashboard } from '../pages/TablesDashboard';
import { MenuAdminPage } from '../pages/MenuAdminPage';
import { KitchenDisplayPage } from '../pages/KitchenDisplayPage';
import { SettingsPage } from '../pages/SettingsPage';
import { UsersPage } from '../pages/UsersPage';
import { MobileOrderPage } from '../pages/mobile/MobileOrderPage';
import { MobileTablesPage } from '../pages/mobile/MobileTablesPage';

const RootRedirect: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const role = user?.role?.toUpperCase();
  if (role === 'COCINA') {
    return <Navigate to="/kitchen" replace />;
  }
  if (role === 'MESERO') {
    return <Navigate to="/mobile/tables" replace />;
  }
  return <Navigate to="/tables" replace />;
};

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* 🔓 Públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/mobile/login" element={<MobileLoginPage />} />

      {/* 🔒 Protegidas por Rol */}
      <Route
        path="/tables"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'MESERO']}>
            <TablesDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/menu"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <MenuAdminPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/kitchen"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'COCINA']}>
            <KitchenDisplayPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <SettingsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/users"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <UsersPage />
          </ProtectedRoute>
        }
      />

      {/* 📱 Comandera Móvil */}
      <Route
        path="/mobile/tables"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'MESERO']}>
            <MobileTablesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mobile/order/:tableId"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'MESERO']}>
            <MobileOrderPage />
          </ProtectedRoute>
        }
      />

      {/* Redirección Automática */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
};