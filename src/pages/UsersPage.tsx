// src/pages/UsersPage.tsx
import React, { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { useLanguage } from '../context/LanguageContext';
import type { User, Role, RoleFormData } from '../types/user';

// Módulos y acciones configurables
const PERMISSION_MODULES = [
  { id: 'TABLES', label: 'Mesas / Salón', actions: ['GET', 'POST', 'PUT', 'DELETE'] },
  { id: 'MENU', label: 'Productos / Menú', actions: ['GET', 'POST', 'PUT', 'DELETE'] },
  { id: 'ORDERS', label: 'Comandas / Pedidos', actions: ['GET', 'POST', 'PUT', 'DELETE'] },
  { id: 'INVENTORY', label: 'Inventario / Stock', actions: ['GET', 'POST', 'PUT', 'DELETE'] },
  { id: 'USERS', label: 'Personal / Usuarios', actions: ['GET', 'POST', 'PUT', 'DELETE'] },
  { id: 'ROLES', label: 'Roles y Permisos', actions: ['GET', 'POST', 'PUT', 'DELETE'] },
];

export const UsersPage: React.FC = () => {
  const { t } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  // Modales
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Formularios
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    posPin: '',
    roleId: ''
  });

  const [roleForm, setRoleForm] = useState<RoleFormData>({
    name: '',
    description: '',
    permissions: []
  });

  const fetchRoles = async () => {
    try {
      const fetchedRoles = await userService.getRoles();
      const roleList = Array.isArray(fetchedRoles) ? fetchedRoles : [];
      setRoles(roleList);
      return roleList;
    } catch (error) {
      setRoles([]);
      return [];
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fetchedUsers] = await Promise.all([
        userService.getUsers(),
        fetchRoles()
      ]);
      setUsers(Array.isArray(fetchedUsers) ? fetchedUsers : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handlers para Usuario
  const handleOpenCreateUser = async () => {
    setEditingUser(null);
    const availableRoles = await fetchRoles();
    setUserForm({
      name: '',
      email: '',
      posPin: '',
      roleId: availableRoles.length > 0 ? availableRoles[0].id : ''
    });
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = async (user: User) => {
    setEditingUser(user);
    await fetchRoles();
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
      alert('Error guardando el usuario.');
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await userService.toggleUserStatus(user.id);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  // Handlers para Permisos y Roles
  const togglePermission = (permissionKey: string) => {
    setRoleForm((prev) => {
      const exists = prev.permissions.includes(permissionKey);
      return {
        ...prev,
        permissions: exists
          ? prev.permissions.filter((p) => p !== permissionKey)
          : [...prev.permissions, permissionKey]
      };
    });
  };

  const toggleAllModulePermissions = (moduleId: string, actions: string[]) => {
    const allKeys = actions.map((act) => `${moduleId}_${act}`);
    const allSelected = allKeys.every((k) => roleForm.permissions.includes(k));

    setRoleForm((prev) => ({
      ...prev,
      permissions: allSelected
        ? prev.permissions.filter((p) => !allKeys.includes(p))
        : Array.from(new Set([...prev.permissions, ...allKeys]))
    }));
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleForm.name.trim()) {
      alert('El nombre del rol es obligatorio.');
      return;
    }

    try {
      await userService.createRole({
        ...roleForm,
        name: roleForm.name.trim().toUpperCase()
      });
      setRoleForm({ name: '', description: '', permissions: [] });
      setIsRoleModalOpen(false);
      await fetchRoles();
    } catch (error: any) {
      const apiMessage = error.response?.data?.message || 'Error al crear el rol.';
      alert(apiMessage);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{t('users.title', 'Gestión de Personas y Roles')}</h1>
          <p className="text-sm text-gray-500">{t('users.subtitle', 'Administra usuarios, PIN de acceso y roles con permisos a medida.')}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setRoleForm({ name: '', description: '', permissions: [] });
              setIsRoleModalOpen(true);
            }}
            className="px-4 py-2 border border-purple-300 text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
          >
            + Nuevo Rol Personalizado
          </button>
          <button
            onClick={handleOpenCreateUser}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors cursor-pointer"
          >
            {t('users.newUser', '+ Nuevo Usuario')}
          </button>
        </div>
      </div>

      {/* LISTA DE ROLES EXISTENTES */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">Roles Configurados en el Sistema</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {roles.map((r) => {
            const isSystemRole = r.name === 'SUPER_ADMIN' || r.name === 'ADMIN';
            return (
              <div key={r.id} className="p-4 rounded-xl border border-gray-200 bg-gray-50/60 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-black tracking-wide ${
                      r.name === 'SUPER_ADMIN' ? 'bg-red-100 text-red-700' :
                      r.name === 'ADMIN' ? 'bg-blue-100 text-blue-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {r.name}
                    </span>
                    {isSystemRole && (
                      <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded font-bold">SISTEMA</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">{r.description || 'Sin descripción adicional.'}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-gray-200 text-[11px] text-gray-500">
                  Permisos: <strong className="text-gray-800">{r.permissions?.length || (isSystemRole ? 'TOTALES' : 0)}</strong>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* TABLA DE USUARIOS */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando personal...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <th className="p-4 pl-6">{t('users.name', 'Nombre')}</th>
                <th className="p-4">{t('users.email', 'Correo')}</th>
                <th className="p-4">{t('users.role', 'Rol / Nivel')}</th>
                <th className="p-4">{t('users.pin', 'PIN POS')}</th>
                <th className="p-4">{t('users.status', 'Estado')}</th>
                <th className="p-4 pr-6 text-right">{t('users.actions', 'Acciones')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 pl-6 font-semibold text-gray-800">{u.name}</td>
                  <td className="p-4 text-gray-500">{u.email}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                      u.role?.name === 'SUPER_ADMIN' ? 'bg-red-50 text-red-700 border border-red-200' :
                      u.role?.name === 'ADMIN' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      'bg-purple-50 text-purple-700 border border-purple-200'
                    }`}>
                      {u.role ? u.role.name : t('users.noRole', 'Sin Rol')}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500 font-mono">{u.posPin ? '••••' : '---'}</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 text-xs font-bold rounded-md ${
                        u.active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {u.active ? t('common.active', 'ACTIVO') : t('common.inactive', 'INACTIVO')}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEditUser(u)}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      {t('users.edit', 'Editar')}
                    </button>
                    <button
                      onClick={() => handleToggleStatus(u)}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                        u.active
                          ? 'bg-red-50 hover:bg-red-100 text-red-600'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600'
                      }`}
                    >
                      {u.active ? t('users.deactivate', 'Desactivar') : t('users.activate', 'Activar')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL USUARIO */}
      {isUserModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {editingUser ? t('users.editUser', 'Editar Usuario') : t('users.createUser', 'Crear Nuevo Usuario')}
            </h2>
            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">{t('users.name', 'Nombre')}</label>
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
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">{t('users.email', 'Correo Electrónico')}</label>
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
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Rol Asignado</label>
                <select
                  value={userForm.roleId}
                  onChange={(e) => setUserForm({ ...userForm, roleId: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  <option value="">-- Seleccionar Rol --</option>
                  <optgroup label="Roles del Sistema">
                    {roles
                      .filter((r) => r.name === 'SUPER_ADMIN' || r.name === 'ADMIN')
                      .map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="Roles Personalizados">
                    {roles
                      .filter((r) => r.name !== 'SUPER_ADMIN' && r.name !== 'ADMIN')
                      .map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">{t('users.pin', 'PIN POS (4 dígitos)')}</label>
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
                  className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  {t('common.cancel', 'Cancelar')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm cursor-pointer"
                >
                  {t('common.save', 'Guardar')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CREAR ROL CON MATRIZ DE PERMISOS GRANULARES */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-1">Crear Rol Personalizado</h2>
            <p className="text-xs text-gray-500 mb-4">Define el nombre del rol y marca individualmente las acciones permitidas (GET, POST, PUT, DELETE).</p>

            <form onSubmit={handleSaveRole} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Nombre del Rol</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. CAJERO, COCINERO, SUPERVISOR"
                    value={roleForm.name}
                    onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-sm uppercase font-semibold focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Descripción</label>
                  <input
                    type="text"
                    placeholder="Ej. Acceso a toma de comandas y caja"
                    value={roleForm.description}
                    onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              </div>

              {/* MATRIZ DE PERMISOS */}
              <div className="border border-gray-200 rounded-xl overflow-hidden mt-4">
                <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200 flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-700 uppercase">Módulo / Sección</span>
                  <span className="text-xs font-bold text-gray-700 uppercase pr-2">Acciones HTTP Permitidas</span>
                </div>

                <div className="divide-y divide-gray-100">
                  {PERMISSION_MODULES.map((mod) => (
                    <div key={mod.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-gray-50/50">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleAllModulePermissions(mod.id, mod.actions)}
                          className="text-xs font-bold text-purple-700 hover:underline cursor-pointer"
                        >
                          {mod.label}
                        </button>
                      </div>

                      <div className="flex items-center gap-4 flex-wrap">
                        {mod.actions.map((act) => {
                          const permKey = `${mod.id}_${act}`;
                          const isChecked = roleForm.permissions.includes(permKey);
                          return (
                            <label key={act} className="flex items-center gap-1.5 text-xs font-medium text-gray-700 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => togglePermission(permKey)}
                                className="rounded text-purple-600 focus:ring-purple-500 h-4 w-4 cursor-pointer"
                              />
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                act === 'GET' ? 'bg-blue-50 text-blue-700' :
                                act === 'POST' ? 'bg-emerald-50 text-emerald-700' :
                                act === 'PUT' ? 'bg-amber-50 text-amber-700' :
                                'bg-rose-50 text-rose-700'
                              }`}>
                                {act}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsRoleModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  {t('common.cancel', 'Cancelar')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold shadow-sm cursor-pointer"
                >
                  Guardar Rol y Permisos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};