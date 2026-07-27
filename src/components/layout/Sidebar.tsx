// src/components/layout/Sidebar.tsx
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

export const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const navigate = useNavigate();

  const navSections = [
    {
      title: 'Tu Restaurante',
      items: [
        { label: 'Mesas / Salón', path: '/tables', icon: '🪑' },
        { label: 'Productos / Menú', path: '/menu', icon: '🍔' },
        { label: 'Configuración', path: '/settings', icon: '⚙️' },
      ],
    },
    {
      title: 'Gestión',
      items: [
        { label: 'Personas', path: '/users', icon: '👥' },
      ],
    },
  ];

  const handleLogout = () => {
    // Aquí puedes limpiar tokens de sesión si los usas
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <aside
      className={`bg-[#1e2026] text-gray-300 flex flex-col h-screen select-none border-r border-gray-800 shrink-0 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Header Brand + Toggle Button */}
      <div className="h-14 flex items-center justify-between px-3 border-b border-gray-800">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-7 h-7 rounded bg-red-500 flex items-center justify-center font-bold text-white text-xs shrink-0">
            t
          </div>
          {!isCollapsed && (
            <span className="font-bold text-white text-sm tracking-wide transition-opacity">
              toteat
            </span>
          )}
        </div>

        {/* Botón para Achicar / Agrandar Sidebar */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-md hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
          title={isCollapsed ? 'Agrandar' : 'Achicar'}
        >
          {isCollapsed ? '➔' : '⬅'}
        </button>
      </div>

      {/* Navigation Tree */}
      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-6 text-xs">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {!isCollapsed && (
              <p className="px-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {section.title}
              </p>
            )}
            {section.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-colors ${
                    isActive
                      ? 'bg-[#2a2d34] text-white font-semibold border-l-2 border-red-500'
                      : 'text-gray-400 hover:bg-[#252830] hover:text-gray-200'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`
                }
                title={isCollapsed ? item.label : undefined}
              >
                <span className="text-sm">{item.icon}</span>
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      {/* Footer / Logout */}
      <div className="p-2 border-t border-gray-800 text-xs">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-red-400 hover:bg-red-500/10 hover:text-red-300 font-semibold transition-colors ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
          title="Cerrar Sesión"
        >
          <span className="text-sm">🚪</span>
          {!isCollapsed && <span>Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;