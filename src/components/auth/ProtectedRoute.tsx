// src/components/auth/ProtectedRoute.tsx
import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = user?.role?.toUpperCase() || '';
  const isAdmin = userRole.includes('ADMIN'); // 👈 SUPER_ADMIN, ADMIN, etc.

  // Los administradores tienen acceso total inmediato
  if (isAdmin) {
    return <>{children}</>;
  }

  // Validación por roles específicos
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return (
      <div className="min-h-screen bg-[#0d0f12] text-white flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="bg-[#181b22] border border-gray-800 p-8 rounded-3xl max-w-md w-full shadow-2xl space-y-6">
          <div className="w-16 h-16 bg-red-950/60 border border-red-800/60 text-red-500 rounded-2xl flex items-center justify-center text-3xl mx-auto">
            🚫
          </div>

          <div>
            <h2 className="text-xl font-black text-white">Acceso Denegado</h2>
            <p className="text-gray-400 text-xs mt-2 leading-relaxed">
              Tu rol actual (<strong className="text-red-400">{userRole}</strong>) no tiene acceso a esta sección.
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            {userRole === 'COCINA' && (
              <button
                type="button"
                onClick={() => navigate('/kitchen')}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
              >
                👨‍🍳 Ir a Cocina (KDS)
              </button>
            )}

            {userRole === 'MESERO' && (
              <button
                type="button"
                onClick={() => navigate('/mobile/tables')}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
              >
                📱 Ir a Comandera de Mesas
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs rounded-xl border border-gray-700 cursor-pointer"
            >
              🚪 Cerrar Sesión e Ir al Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};