// src/pages/UsersPage.tsx
import React, { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { useLanguage } from '../context/LanguageContext';
import type { User, Role, RoleFormData } from '../types/user';
import { DeleteIcon, PencilIcon } from '../components/common/Icons';

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
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  // Formularios
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    posPin: '',
    roleId: '',
  });

  const [roleForm, setRoleForm] = useState<RoleFormData>({
    name: '',
    description: '',
    permissions: [],
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
        fetchRoles(),
      ]);
      setUsers(Array.isArray(fetchedUsers) ? fetchedUsers : []);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- ACCIONES DE USUARIO ---
  const handleOpenCreateUser = async () => {
    setEditingUser(null);
    const availableRoles = await fetchRoles();
    setUserForm({
      name: '',
      email: '',
      posPin: '',
      roleId: availableRoles.length > 0 ? availableRoles[0].id : '',
    });
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = async (user: User) => {
    setEditingUser(user);
    const availableRoles = await fetchRoles();
    const roleValue = user.role as any;
    let currentRoleId = '';

    if (roleValue && typeof roleValue === 'object') {
      currentRoleId = roleValue.id || '';
    } else if (typeof roleValue === 'string') {
      const found = availableRoles.find((r) => r.name === roleValue || r.id === roleValue);
      currentRoleId = found ? found.id : roleValue;
    }

    setUserForm({
      name: user.name || '',
      email: user.email || '',
      posPin: user.posPin || '',
      roleId: currentRoleId || availableRoles[0]?.id || '',
    });
    setIsUserModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: userForm.name,
        email: userForm.email,
        posPin: userForm.posPin,
        role: userForm.roleId,
        roleId: userForm.roleId,
      };

      if (editingUser) {
        await userService.updateUser(editingUser.id, payload);
      } else {
        await userService.createUser(payload);
      }

      setIsUserModalOpen(false);
      setEditingUser(null);
      await fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error guardando usuario.');
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await userService.toggleUserStatus(user.id);
      await fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!window.confirm(`¿Eliminar a "${user.name}"?`)) return;
    try {
      await userService.deleteUser(user.id);
      await fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error eliminando usuario.');
    }
  };

  // --- ACCIONES DE ROLES ---
  const handleOpenCreateRole = () => {
    setEditingRole(null);
    setRoleForm({ name: '', description: '', permissions: [] });
    setIsRoleModalOpen(true);
  };

  const handleOpenEditRole = (role: Role) => {
    setEditingRole(role);
    setRoleForm({
      name: role.name,
      description: role.description || '',
      permissions: Array.isArray(role.permissions) ? role.permissions : [],
    });
    setIsRoleModalOpen(true);
  };

  const handleDeleteRole = async (role: Role) => {
    if (role.name === 'SUPER_ADMIN' || role.name === 'ADMIN') {
      alert('No se pueden eliminar los roles base del sistema.');
      return;
    }
    if (!window.confirm(`¿Eliminar el rol "${role.name}"? Los usuarios asignados quedarán sin rol.`)) return;
    try {
      await userService.deleteRole(role.id);
      await fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error eliminando rol.');
    }
  };

  const togglePermission = (permissionKey: string) => {
    setRoleForm((prev) => {
      const exists = prev.permissions.includes(permissionKey);
      return {
        ...prev,
        permissions: exists
          ? prev.permissions.filter((p) => p !== permissionKey)
          : [...prev.permissions, permissionKey],
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
        : Array.from(new Set([...prev.permissions, ...allKeys])),
    }));
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleForm.name.trim()) return;

    try {
      const payload = {
        ...roleForm,
        name: roleForm.name.trim().toUpperCase(),
      };

      if (editingRole) {
        await userService.updateRole(editingRole.id, payload);
      } else {
        await userService.createRole(payload);
      }

      setRoleForm({ name: '', description: '', permissions: [] });
      setEditingRole(null);
      setIsRoleModalOpen(false);
      await fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al guardar rol.');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 select-none">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl border border-gray-200 shadow-xs gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{t('users.title')}</h1>
          <p className="text-xs text-gray-500 mt-1">{t('users.subtitle')}</p>
        </div>
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={handleOpenCreateRole}
            className="px-4 py-2 border border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            {t('users.newRole')}
          </button>
          <button
            type="button"
            onClick={handleOpenCreateUser}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            {t('users.newUser')}
          </button>
        </div>
      </div>

      {/* LISTA DE ROLES */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
          {t('users.rolesConfigured')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {roles.map((r) => {
            const isSystemRole = r.name === 'SUPER_ADMIN' || r.name === 'ADMIN';
            return (
              <div key={r.id} className="p-4 rounded-xl border border-gray-200 bg-gray-50/60 flex flex-col justify-between hover:shadow-xs transition-shadow">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-xs font-black tracking-wide ${
                        r.name === 'SUPER_ADMIN'
                          ? 'bg-red-100 text-red-700'
                          : r.name === 'ADMIN'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {r.name}
                    </span>

                    {isSystemRole ? (
                      <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded font-bold uppercase">
                        {t('users.systemBadge')}
                      </span>
                    ) : (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditRole(r)}
                          className="p-1 hover:bg-gray-200 rounded text-gray-600 cursor-pointer"
                        >
                          <PencilIcon className="w-3.5 h-3.5"/>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRole(r)}
                          className="p-1 hover:bg-red-100 rounded text-red-600 cursor-pointer"
                        >
                          <DeleteIcon className="w-3.5 h-3.5"/>
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">{r.description || t('users.noDesc')}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-gray-200 text-[11px] text-gray-500 flex justify-between items-center">
                  <span>{t('users.permissionsCount')}</span>
                  <strong className="text-gray-800">{r.permissions?.length || (isSystemRole ? 'TOTAL' : 0)}</strong>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* TABLA DE USUARIOS */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 text-xs font-semibold">{t('common.loading')}</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <th className="p-4 pl-6">{t('users.name')}</th>
                <th className="p-4">{t('users.email')}</th>
                <th className="p-4">{t('users.role')}</th>
                <th className="p-4">{t('users.pin')}</th>
                <th className="p-4">{t('users.status')}</th>
                <th className="p-4 pr-6 text-right">{t('users.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {users.map((u) => {
                const roleName = typeof u.role === 'object' && u.role ? (u.role as any).name : u.role || '---';
                return (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 pl-6 font-bold text-gray-800">{u.name}</td>
                    <td className="p-4 text-gray-500">{u.email}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-md ${
                          roleName === 'SUPER_ADMIN'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : roleName === 'ADMIN'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}
                      >
                        {roleName}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500 font-mono">{u.posPin ? '••••' : '---'}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-md uppercase ${
                          u.active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {u.active ? t('common.active') : t('common.inactive')}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditUser(u)}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg cursor-pointer"
                      >
                        {t('common.edit')}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(u)}
                        className={`px-3 py-1 text-xs font-semibold rounded-lg cursor-pointer ${
                          u.active
                            ? 'bg-amber-50 hover:bg-amber-100 text-amber-700'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {u.active ? t('users.deactivate') : t('users.activate')}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(u)}
                        className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold rounded-lg cursor-pointer"
                      >
                        {t('common.delete')}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL USUARIO */}
      {isUserModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-gray-200 space-y-4">
            <h2 className="text-lg font-bold text-gray-800">
              {editingUser ? t('common.edit') : t('users.newUser')}
            </h2>
            <form onSubmit={handleSaveUser} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">{t('users.name')}</label>
                <input
                  type="text"
                  required
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold outline-none focus:border-red-500"
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">{t('users.email')}</label>
                  <input
                    type="email"
                    required
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold outline-none focus:border-red-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">{t('users.role')}</label>
                <select
                  value={userForm.roleId}
                  onChange={(e) => setUserForm({ ...userForm, roleId: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold outline-none focus:border-red-500"
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
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">{t('users.pin')}</label>
                <input
                  type="password"
                  maxLength={4}
                  value={userForm.posPin}
                  onChange={(e) => setUserForm({ ...userForm, posPin: e.target.value })}
                  placeholder="Ej. 1234"
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs outline-none focus:border-red-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  {t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CREAR / EDITAR ROL */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto space-y-4">
            <h2 className="text-lg font-bold text-gray-800">
              {editingRole ? `Editar Rol: ${editingRole.name}` : t('users.newRole')}
            </h2>
            <form onSubmit={handleSaveRole} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Nombre del Rol</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. CAJERO, COCINERO"
                    value={roleForm.name}
                    onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-bold uppercase outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Descripción</label>
                  <input
                    type="text"
                    placeholder="Ej. Acceso a toma de comandas y caja"
                    value={roleForm.description}
                    onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* MATRIZ DE PERMISOS */}
              <div className="border border-gray-200 rounded-xl overflow-hidden mt-3">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center text-xs font-bold text-gray-700 uppercase">
                  <span>Módulo</span>
                  <span>Acciones Permitidas</span>
                </div>
                <div className="divide-y divide-gray-100">
                  {PERMISSION_MODULES.map((mod) => (
                    <div
                      key={mod.id}
                      className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-gray-50/50"
                    >
                      <button
                        type="button"
                        onClick={() => toggleAllModulePermissions(mod.id, mod.actions)}
                        className="text-xs font-bold text-purple-700 hover:underline cursor-pointer text-left"
                      >
                        {mod.label}
                      </button>
                      <div className="flex items-center gap-3 flex-wrap">
                        {mod.actions.map((act) => {
                          const permKey = `${mod.id}_${act}`;
                          const isChecked = roleForm.permissions.includes(permKey);
                          return (
                            <label
                              key={act}
                              className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => togglePermission(permKey)}
                                className="rounded text-purple-600 focus:ring-purple-500 h-3.5 w-3.5 cursor-pointer"
                              />
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                                  act === 'GET'
                                    ? 'bg-blue-50 text-blue-700'
                                    : act === 'POST'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : act === 'PUT'
                                    ? 'bg-amber-50 text-amber-700'
                                    : 'bg-rose-50 text-rose-700'
                                }`}
                              >
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

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setIsRoleModalOpen(false);
                    setEditingRole(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  {editingRole ? t('common.save') : 'Guardar Rol'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;