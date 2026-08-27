// src/components/layout/Sidebar.tsx
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useRestaurant } from '../../context/RestaurantContext';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { settings } = useRestaurant();
  const { user, logout } = useAuth();

  // 1. Extraer y limpiar el rol del usuario
  const getCleanRole = (): string => {
    if (!user || !user.role) return '';
    if (typeof user.role === 'string') return user.role.toUpperCase();
    if (typeof user.role === 'object' && (user.role as any).name) {
      return String((user.role as any).name).toUpperCase();
    }
    return String(user.role).toUpperCase();
  };

  const userRole = getCleanRole();
  // Cualquier rol que contenga "ADMIN" (ADMIN, SUPER_ADMIN, ROLE_ADMIN) tiene acceso total
  const isAdministrator = userRole.includes('ADMIN') || userRole === '';

  // 2. Definición de rutas y roles permitidos
  const navSections = [
    {
      title: t('nav.yourRestaurant', 'Tu Restaurante'),
      items: [
        {
          label: t('nav.tables', 'Mesas / Salón'),
          path: '/tables',
          icon: '🪑',
          allowedRoles: ['ADMIN', 'SUPER_ADMIN', 'MESERO'],
        },
        {
          label: t('nav.menu', 'Productos / Menú'),
          path: '/menu',
          icon: '🍔',
          allowedRoles: ['ADMIN', 'SUPER_ADMIN'],
        },
        {
          label: 'Cocina / KDS',
          path: '/kitchen',
          icon: '👨‍🍳',
          allowedRoles: ['ADMIN', 'SUPER_ADMIN', 'COCINA'],
        },
        {
          label: t('nav.settings', 'Configuración'),
          path: '/settings',
          icon: '⚙️',
          allowedRoles: ['ADMIN', 'SUPER_ADMIN'],
        },
      ],
    },
    {
      title: t('nav.management', 'Gestión'),
      items: [
        {
          label: t('nav.reports', 'Reportes y Ventas'),
          path: '/reports',
          icon: '📊',
          allowedRoles: ['ADMIN', 'SUPER_ADMIN'],
        },
        {
          label: t('nav.users', 'Personas / Personal'),
          path: '/users',
          icon: '👥',
          allowedRoles: ['ADMIN', 'SUPER_ADMIN'],
        },
      ],
    },
  ];

  // 3. Filtrado: Administrador ve TODO; otros roles ven solo lo autorizado
  const filteredSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (isAdministrator) return true;
        return item.allowedRoles.includes(userRole);
      }),
    }))
    .filter((section) => section.items.length > 0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={`bg-[#1e2026] text-gray-300 flex flex-col h-screen select-none border-r border-gray-800 shrink-0 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Header / Logo */}
      <div className="h-14 flex items-center justify-between px-3 border-b border-gray-800">
        <div className="flex items-center gap-2 overflow-hidden">
          {settings.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt={settings.name}
              className="w-7 h-7 rounded object-cover border border-gray-700 shrink-0"
            />
          ) : (
            <div className="w-7 h-7 rounded bg-red-600 flex items-center justify-center font-black text-white text-xs shrink-0">
              {settings.logoInitial}
            </div>
          )}

          {!isCollapsed && (
            <span className="font-black text-white text-sm tracking-wide truncate">
              {settings.name}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-md hover:bg-gray-800 text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          {isCollapsed ? '➔' : '⬅'}
        </button>
      </div>

      {/* Lista de Navegación */}
      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-6 text-xs">
        {filteredSections.map((section, idx) => (
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
                  `flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#2a2d34] text-white font-semibold border-l-2 border-red-500'
                      : 'text-gray-400 hover:bg-[#252830] hover:text-gray-200'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`
                }
              >
                <span className="text-sm">{item.icon}</span>
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      {/* Footer de Usuario y Logout */}
      <div className="p-3 border-t border-gray-800 text-xs space-y-2">
        {!isCollapsed && (
          <div className="px-1">
            <p className="font-bold text-gray-200 truncate">{user?.name || 'Usuario'}</p>
            <span className="text-[10px] text-red-400 font-extrabold uppercase bg-red-950/50 px-1.5 py-0.5 rounded border border-red-900/50 inline-block mt-0.5">
              {userRole || 'ADMIN'}
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-red-400 hover:bg-red-500/10 hover:text-red-300 font-semibold transition-colors cursor-pointer ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
        >
          <span className="text-sm">🚪</span>
          {!isCollapsed && <span>{t('nav.logout', 'Cerrar Sesión')}</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;