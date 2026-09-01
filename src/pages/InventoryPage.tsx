// src/pages/InventoryPage.tsx
import React, { useEffect, useState } from 'react';
import { inventoryService, type Ingredient } from '../services/inventoryService';

export const InventoryPage: React.FC = () => {
  // --- ESTADOS LOCALES ---
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<Ingredient | null>(null);

  const [formData, setFormData] = useState<Ingredient>({
    name: '',
    stockQuantity: 0,
    unit: 'Kg',
    minStockWarning: 5,
  });

  // --- CARGA DE INVENTARIO ---
  const fetchIngredients = async () => {
    try {
      setLoading(true);
      const data = await inventoryService.getIngredients();
      setIngredients(data);
    } catch (error) {
      console.error('Error al cargar inventario:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  // --- MANEJADORES DE FORMULARIO ---
  const handleOpenModal = (item?: Ingredient) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({ name: '', stockQuantity: 0, unit: 'Kg', minStockWarning: 5 });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem?.id) {
        await inventoryService.updateIngredient(editingItem.id, formData);
      } else {
        await inventoryService.createIngredient(formData);
      }
      setIsModalOpen(false);
      fetchIngredients();
    } catch (error) {
      console.error('Error al guardar insumo:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar este insumo del inventario?')) {
      await inventoryService.deleteIngredient(id);
      fetchIngredients();
    }
  };

  return (
    <div className="p-6">
      
      {/* --- ENCABEZADO --- */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Inventario Físico de Insumos</h1>
          <p className="text-sm text-gray-500">Gestión de stock de cocina y barra</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          + Agregar Insumo
        </button>
      </div>

      {/* --- TABLA DE INVENTARIO --- */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Cargando inventario...</div>
      ) : ingredients.length === 0 ? (
        <div className="bg-white p-8 text-center rounded-xl border border-gray-200">
          <p className="text-gray-500 mb-4">No tienes insumos registrados en el inventario.</p>
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-lg"
          >
            + Registrar Primer Insumo
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase border-b border-gray-200">
              <tr>
                <th className="px-6 py-3">Nombre Insumo</th>
                <th className="px-6 py-3">Stock Actual</th>
                <th className="px-6 py-3">Unidad</th>
                <th className="px-6 py-3">Alerta Stock Mín.</th>
                <th className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ingredients.map((item) => {
                const isLow = item.minStockWarning && item.stockQuantity <= item.minStockWarning;
                return (
                  <tr key={item.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-semibold text-gray-800">{item.name}</td>
                    <td className="px-6 py-4">
                      <span className={`font-bold ${isLow ? 'text-red-600' : 'text-emerald-600'}`}>
                        {item.stockQuantity}
                      </span>
                      {isLow && (
                        <span className="ml-2 px-2 py-0.5 text-[10px] bg-red-100 text-red-700 rounded-full font-bold">
                          ⚠️ Bajo Stock
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500">{item.unit}</td>
                    <td className="px-6 py-4 text-gray-500">{item.minStockWarning || '-'}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenModal(item)}
                        className="text-blue-600 font-bold hover:underline cursor-pointer text-xs"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => item.id && handleDelete(item.id)}
                        className="text-red-500 font-bold hover:underline cursor-pointer text-xs"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* --- MODAL AGREGAR / EDITAR INSUMO --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {editingItem ? 'Editar Insumo' : 'Agregar Nuevo Insumo'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nombre Insumo</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Ej. Carne de Res, Tomate, Aceite"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Cantidad Stock</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min="0"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Unidad de Medida</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Kg">Kg (Kilogramos)</option>
                    <option value="Gramos">Gramos</option>
                    <option value="Litros">Litros</option>
                    <option value="Unidades">Unidades</option>
                    <option value="Paquetes">Paquetes</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Stock Mínimo para Alerta</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.minStockWarning || 0}
                  onChange={(e) => setFormData({ ...formData, minStockWarning: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm cursor-pointer"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};