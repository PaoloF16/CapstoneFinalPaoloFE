// src/components/layout/Navbar.tsx
import React from 'react';

export const Navbar: React.FC = () => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Search / Left items */}
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-gray-800">Panel de Administración</h1>
      </div>

      {/* Profile / Right items */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium">
          A
        </div>
        <span className="text-sm font-medium text-gray-700">Admin</span>
      </div>
    </header>
  );
};