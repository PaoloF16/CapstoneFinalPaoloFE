// src/components/layout/Sidebar.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';

export const Sidebar: React.FC = () => {
  const navSections = [
    {
      title: 'Tu Restaurante',
      items: [
        { label: 'Restaurants', path: '/restaurants' },
        { label: 'Productos', path: '/menu' },
        { label: 'Configuración', path: '/settings' },
        { label: 'Operaciones', path: '/operations' },
        { label: 'Toteat Shop', path: '/shop' },
      ],
    },
    {
      title: 'Gestión',
      items: [
        { label: 'Personas', path: '/users' },
        { label: 'Integraciones', path: '/integrations' },
        { label: 'Reportes', path: '/reports' },
        { label: 'Stock Control', path: '/stock' },
      ],
    },
  ];

  return (
    <aside className="w-60 bg-[#1e2026] text-gray-300 flex flex-col h-screen select-none border-r border-gray-800">
      {/* App Brand Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-red-500 flex items-center justify-center font-bold text-white text-xs">
            t
          </div>
          <span className="font-bold text-white text-sm tracking-wide">toteat</span>
        </div>
        <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-mono">
          Manager
        </span>
      </div>

      {/* Navigation Tree */}
      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-6 text-xs">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <p className="px-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {section.title}
            </p>
            {section.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-md font-medium transition-colors ${
                    isActive
                      ? 'bg-[#2a2d34] text-white font-semibold border-l-2 border-red-500'
                      : 'text-gray-400 hover:bg-[#252830] hover:text-gray-200'
                  }`
                }
              >
                <span>{item.label}</span>
                <span className="text-[10px] text-gray-600">›</span>
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      {/* Footer Settings / Help */}
      <div className="p-3 border-t border-gray-800 text-[11px] text-gray-400 space-y-2">
        <div className="flex items-center justify-between px-2 py-1 hover:bg-[#252830] rounded cursor-pointer">
          <span className="flex items-center gap-2">
            <span>🌐</span> Español
          </span>
          <span className="text-[9px]">▼</span>
        </div>
        <div className="flex items-center gap-2 px-2 py-1 hover:bg-[#252830] rounded cursor-pointer">
          <span>❓</span> Ayuda & Soporte
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;