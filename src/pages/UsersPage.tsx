// ==========================================
// COMPONENTE PRINCIPAL - GESTIÓN DE PERSONAL
// ==========================================

import React, { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import type { User, Role } from '../types/user';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para Modales
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Formulario Usuario
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    posPin: '',
    roleId: ''
  });

  // Formulario Rol
  const [roleForm, setRoleForm] = useState({
    name: '',
    description: ''
  });

  // Carga Inicial de Datos
  const fetchData = async () => {
    setLoading(true);
    try {
      const [fetchedUsers, fetchedRoles] = await Promise.all([
        userService.getUsers(),
        userService.getRoles()
      ]);
      setUsers(Array.isArray(fetchedUsers) ? fetchedUsers : []);
      setRoles(Array.isArray(fetchedRoles) ? fetchedRoles : []);
    } catch (error) {
      console.error('Error al cargar personal y roles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handlers para Usuario (Crear / Editar / Desactivar)
  const handleOpenCreateUser = () => {
    setEditingUser(null);
    setUserForm({
      name: '',
      email: '',
      posPin: '',
      roleId: roles[0]?.id || ''
    });
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (user: User) => {
    setEditingUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      posPin: user.posPin || '',
      roleId: user.role?.id || ''
    });
    setIsUserModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await userService.updateUser(editingUser.id, userForm);
      } else {
        await userService.createUser(userForm);
      }
      setIsUserModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      alert('Ocurrió un error al guardar el usuario.');
    }
  };

  const handleToggleStatus = async (user: User) => {
    const action = user.active ? 'desactivar' : 'activar';
    if (confirm(`¿Seguro que deseas ${action} a ${user.name}?`)) {
      try {
        await userService.toggleUserStatus(user.id);
        fetchData();
      } catch (error) {
        console.error('Error al cambiar estado:', error);
      }
    }
  };

  // Handler para Crear Nuevo Rol
  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userService.createRole(roleForm);
      setRoleForm({ name: '', description: '' });
      setIsRoleModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error al crear rol:', error);
      alert('Error al crear el rol.');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* ========================================== */}
      {/* ENCABEZADO Y BOTONES DE ACCIÓN             */}
      {/* ========================================== */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Personas y Personal</h1>
          <p className="text-sm text-gray-500">Administra usuarios, roles y PIN de acceso rápido al POS.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsRoleModalOpen(true)}
            className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            + Nuevo Rol
          </button>
          <button
            onClick={handleOpenCreateUser}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
          >
            + Nuevo Usuario
          </button>
        </div>
      </div>

      {/* ========================================== */}
      {/* TABLA DE PERSONAL                          */}
      {/* ========================================== */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando personal...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <th className="p-4 pl-6">Nombre</th>
                <th className="p-4">Correo</th>
                <th className="p-4">Rol / Permiso</th>
                <th className="p-4">PIN POS</th>
                <th className="p-4">Estado</th>
                <th className="p-4 pr-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 pl-6 font-semibold text-gray-800">{u.name}</td>
                  <td className="p-4 text-gray-500">{u.email}</td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-full">
                      {u.role ? u.role.name : 'Sin Rol'}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500 font-mono">
                    {u.posPin ? '••••' : '---'}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 text-xs font-bold rounded-md ${
                        u.active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {u.active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEditUser(u)}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleToggleStatus(u)}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                        u.active
                          ? 'bg-red-50 hover:bg-red-100 text-red-600'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600'
                      }`}
                    >
                      {u.active ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ========================================== */}
      {/* MODAL PARA CREAR / EDITAR USUARIO          */}
      {/* ========================================== */}
      {isUserModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
            </h2>
            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    required
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Rol / Permiso</label>
                <select
                  value={userForm.roleId}
                  onChange={(e) => setUserForm({ ...userForm, roleId: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">-- Seleccionar Rol --</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">PIN POS (4 dígitos)</label>
                <input
                  type="password"
                  maxLength={4}
                  value={userForm.posPin}
                  onChange={(e) => setUserForm({ ...userForm, posPin: e.target.value })}
                  placeholder="Ej. 1234"
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL PARA CREAR ROL                       */}
      {/* ========================================== */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Crear Nuevo Rol</h2>
            <form onSubmit={handleSaveRole} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Nombre del Rol</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Garzón / Mesero"
                  value={roleForm.name}
                  onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Descripción (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ej. Acceso a toma de comandas"
                  value={roleForm.description}
                  onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsRoleModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold shadow-sm"
                >
                  Crear Rol
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};