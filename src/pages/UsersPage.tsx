// src/pages/UsersPage.tsx
import React, { useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'WAITER' | 'CASHIER' | 'KITCHEN';
  pin: string;
  status: 'ACTIVE' | 'INACTIVE';
}

const MOCK_USERS: User[] = [
  { id: '1', name: 'Marty Burger', email: 'marty@toteat.com', role: 'ADMIN', pin: '1234', status: 'ACTIVE' },
  { id: '2', name: 'Carlos Mendoza', email: 'carlos@toteat.com', role: 'WAITER', pin: '5566', status: 'ACTIVE' },
  { id: '3', name: 'Ana Torres', email: 'ana@toteat.com', role: 'CASHIER', pin: '9900', status: 'ACTIVE' },
];

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);

  const roleLabels = {
    ADMIN: { label: 'Administrador', bg: 'bg-purple-100 text-purple-700' },
    WAITER: { label: 'Garzón / Mesero', bg: 'bg-blue-100 text-blue-700' },
    CASHIER: { label: 'Cajero', bg: 'bg-emerald-100 text-emerald-700' },
    KITCHEN: { label: 'Cocina', bg: 'bg-amber-100 text-amber-700' },
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Gestión de Personas y Personal</h1>
          <p className="text-xs text-gray-500">Administra usuarios, roles y PIN de acceso rápido al POS.</p>
        </div>
        <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors">
          + Nuevo Usuario
        </button>
      </div>

      {/* Tabla de Usuarios */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase">
            <tr>
              <th className="p-4">Nombre</th>
              <th className="p-4">Correo</th>
              <th className="p-4">Rol / Permiso</th>
              <th className="p-4 text-center">PIN POS</th>
              <th className="p-4 text-center">Estado</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-bold text-gray-800">{user.name}</td>
                <td className="p-4 text-gray-500">{user.email}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${roleLabels[user.role].bg}`}>
                    {roleLabels[user.role].label}
                  </span>
                </td>
                <td className="p-4 text-center font-mono font-bold text-gray-600">••••</td>
                <td className="p-4 text-center">
                  <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold">
                    {user.status}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  <button className="px-2.5 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded font-semibold">Editar</button>
                  <button className="px-2.5 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded font-semibold">Desactivar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};