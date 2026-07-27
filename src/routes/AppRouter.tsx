// src/routes/AppRouter.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { TablesDashboard } from '../pages/TablesDashboard';
import { MenuAdminPage } from '../pages/MenuAdminPage';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<TablesDashboard />} />
          <Route path="tables" element={<TablesDashboard />} />
          <Route path="menu" element={<MenuAdminPage />} />
          <Route path="users" element={<div className="p-6 text-gray-800 font-bold text-xl">Módulo de Usuarios</div>} />
          <Route path="settings" element={<div className="p-6 text-gray-800 font-bold text-xl">Configuración</div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};