// src/components/layout/Sidebar.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';

export const Sidebar: React.FC = () => {
  const navItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'Usuarios', path: '/users' },
    { label: 'Configuración', path: '/settings' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col">
      {/* Brand Logo */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <span className="text-lg font-bold tracking-wide text-indigo-400">Capstone App</span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};