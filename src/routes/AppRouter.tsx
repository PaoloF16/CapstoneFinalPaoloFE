// src/routes/AppRouter.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { DashboardPage } from '../pages/DashboardPage';
import { MenuAdminPage } from '../pages/MenuAdminPage';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="menu" element={<MenuAdminPage />} />
          <Route path="users" element={<div className="p-4 text-gray-800 font-bold text-xl">Módulo de Usuarios</div>} />
          <Route path="settings" element={<div className="p-4 text-gray-800 font-bold text-xl">Configuración</div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};