// src/pages/TablesDashboard.tsx
import React, { useEffect, useState } from 'react';
import {
  getTables,
  createTable,
  updateTable,
  deleteTable,
  createOrder,
  getActiveOrderByTable,
  updateOrderItems,
} from '../services/restaurantService';
import { menuService } from '../services/menuService';
import { TableModal } from '../components/tables/TableModal';
import { CreateTableModal } from '../components/tables/CreateTableModal';
import { useLanguage } from '../context/LanguageContext';
import type { RestaurantTable, Order, OrderItem } from '../types/restaurant';

type ExtendedTable = RestaurantTable & {
  currentOrder?: Order;
};

interface LocalMenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
}

export const TablesDashboard: React.FC = () => {
  const { t } = useLanguage();

  // --- ESTADOS LOCALES ---
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [editingTable, setEditingTable] = useState<RestaurantTable | null>(null);

  const [selectedTable, setSelectedTable] = useState<ExtendedTable | null>(null);
  const [isTableModalOpen, setIsTableModalOpen] = useState<boolean>(false);

  // Carta de Menú
  const [menuItems, setMenuItems] = useState<LocalMenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  // --- CARGA DE MESAS Y MENÚ ---
  const fetchTables = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTables();
      setTables(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar mesas:', err);
      setError('No se pudo conectar con el servidor backend (Spring Boot).');
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuData = async () => {
    try {
      const [products, cats] = await Promise.all([
        menuService.getProducts(),
        menuService.getCategories(),
      ]);

      const formattedProducts: LocalMenuItem[] = products.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        category: p.category?.name || 'General',
      }));

      setMenuItems(formattedProducts);
      setCategories(cats.map((c) => c.name));
    } catch (err) {
      console.error('Error al cargar menú:', err);
    }
  };

  useEffect(() => {
    fetchTables();
    fetchMenuData();
  }, []);

  // --- MANEJADORES DE ACCIONES DE MESA ---
  const handleOpenCreateModal = () => {
    setEditingTable(null);
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (e: React.MouseEvent, table: RestaurantTable) => {
    e.stopPropagation();
    setEditingTable(table);
    setIsCreateModalOpen(true);
  };

  const handleDeleteTable = async (e: React.MouseEvent, table: RestaurantTable) => {
    e.stopPropagation();
    if (table.status !== 'AVAILABLE') {
      alert(t('tables.deleteOccupiedError', 'No se puede eliminar una mesa ocupada o en espera.'));
      return;
    }

    if (confirm(`${t('tables.confirmDelete', '¿Seguro que deseas eliminar la Mesa')} #${table.tableNumber}?`)) {
      try {
        await deleteTable(table.id);
        await fetchTables();
      } catch (err) {
        console.error('Error al eliminar mesa:', err);
        alert(t('tables.deleteError', 'Error al eliminar la mesa.'));
      }
    }
  };

  // --- SUBMIT CREAR / EDITAR MESA ---
  const handleSaveTableSubmit = async (tableNumber: number, capacity: number) => {
    if (editingTable) {
      await updateTable(editingTable.id, { tableNumber, capacity });
    } else {
      await createTable({
        tableNumber,
        capacity,
        status: 'AVAILABLE',
      } as RestaurantTable);
    }
    await fetchTables();
  };

  // --- CLIC EN MESA PARA VER COMANDA ---
  const handleSelectTable = async (table: RestaurantTable) => {
    let order: Order | undefined = undefined;

    if (table.status !== 'AVAILABLE') {
      try {
        order = await getActiveOrderByTable(table.id);
      } catch (err) {
        console.log('Sin orden activa previa para la mesa:', table.id);
      }
    }

    setSelectedTable({ ...table, currentOrder: order });
    setIsTableModalOpen(true);
  };

  // --- ACCIONES EN COMANDA ---
  const handleOpenTable = async (tableId: string) => {
    try {
      const newOrder = await createOrder({ tableId, items: [] });
      setSelectedTable((prev) =>
        prev
          ? {
              ...prev,
              status: 'OCCUPIED',
              currentOrder: newOrder,
            }
          : null
      );
      await fetchTables();
    } catch (err) {
      console.error('Error al abrir la mesa:', err);
    }
  };

  const handleUpdateOrder = async (tableId: string, items: OrderItem[]) => {
    try {
      const itemRequests = items.map((i) => ({
        productId: i.product.id,
        quantity: i.quantity,
      }));

      const activeOrderId = selectedTable?.currentOrder?.id;

      if (activeOrderId) {
        const updatedOrder = await updateOrderItems(activeOrderId, itemRequests);
        setSelectedTable((prev) => (prev ? { ...prev, currentOrder: updatedOrder } : null));
      } else {
        const newOrder = await createOrder({ tableId, items: itemRequests });
        setSelectedTable((prev) =>
          prev ? { ...prev, status: 'OCCUPIED', currentOrder: newOrder } : null
        );
      }

      await fetchTables();
    } catch (err) {
      console.error('Error al guardar comanda:', err);
    }
  };

  const handleCloseTable = async (_tableId: string) => {
    setIsTableModalOpen(false);
    setSelectedTable(null);
    await fetchTables();
  };

  // --- RENDERIZADO ESTADO DE CARGA ---
  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500 font-medium">
        {t('tables.loading', 'Cargando salón y mesas...')}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* --- ENCABEZADO ESTILO TOTEAT --- */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {t('tables.title', 'Mapa del Salón / Mesas')}
          </h1>
          <p className="text-sm text-gray-500">
            {t('tables.subtitle', 'Gestión de comandas y mesas en tiempo real')}
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-sm transition-colors cursor-pointer flex items-center gap-2"
        >
          {t('tables.addTable', '+ Agregar Mesa')}
        </button>
      </div>

      {/* --- ALERTA ERROR --- */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex justify-between items-center shadow-sm">
          <span>⚠️ {error}</span>
          <button
            onClick={fetchTables}
            className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 cursor-pointer transition-colors"
          >
            {t('common.retry', 'Reintentar')}
          </button>
        </div>
      )}

      {/* --- ESTADO SIN MESAS --- */}
      {!error && tables.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-gray-100 shadow-sm max-w-lg mx-auto">
          <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center text-2xl mx-auto mb-4 font-bold">
            🪑
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">
            {t('tables.noTables', 'No hay mesas registradas')}
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            {t('tables.noTablesSubtitle', 'Agrega la primera mesa para comenzar a tomar pedidos.')}
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            {t('tables.createFirstTable', '+ Crear Mesa #1')}
          </button>
        </div>
      ) : (
        /* --- GRILLA CON EL DISEÑO MODERNO TARJETAS --- */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {tables.map((table) => {
            const isAvailable = table.status === 'AVAILABLE';
            const isOccupied = table.status === 'OCCUPIED';

            return (
              <div
                key={table.id}
                onClick={() => handleSelectTable(table)}
                className={`p-5 rounded-2xl border bg-white shadow-sm flex flex-col justify-between hover:shadow-md transition-all cursor-pointer ${
                  isAvailable
                    ? 'border-emerald-200 hover:border-emerald-500'
                    : isOccupied
                    ? 'border-rose-200 hover:border-rose-500'
                    : 'border-amber-200 hover:border-amber-500'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                        {t('tables.tablePrefix', 'Mesa')}
                      </span>
                      <h3 className="text-2xl font-black text-gray-800">#{table.tableNumber}</h3>
                    </div>
                    <span
                      className={`px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-full border ${
                        isAvailable
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : isOccupied
                          ? 'bg-rose-50 border-rose-200 text-rose-700'
                          : 'bg-amber-50 border-amber-200 text-amber-700'
                      }`}
                    >
                      {isAvailable
                        ? t('tables.available', 'Libre')
                        : isOccupied
                        ? t('tables.occupied', 'Ocupada')
                        : t('tables.waiting', 'Esperando')}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 mb-4 flex items-center gap-1">
                    <span>🪑</span>
                    <span>{t('tables.capacity', 'Capacidad')}:</span>
                    <strong className="text-gray-700">{table.capacity} {t('tables.people', 'personas')}</strong>
                  </p>
                </div>

                {/* --- BOTONES EDITAR Y ELIMINAR --- */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <span className="text-emerald-700 font-bold hover:underline text-xs">
                    {t('tables.viewOrder', 'Ver comanda →')}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => handleOpenEditModal(e, table)}
                      className="px-2.5 py-1 bg-gray-50 border border-gray-200 text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      ✏️ {t('tables.edit', 'Editar')}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteTable(e, table)}
                      className="px-2.5 py-1 bg-gray-50 border border-gray-200 text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      🗑️ {t('tables.delete', 'Borrar')}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- MODAL CREAR / EDITAR MESA --- */}
      <CreateTableModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingTable(null);
        }}
        onSubmit={handleSaveTableSubmit}
        suggestedTableNumber={tables.length + 1}
        initialData={editingTable}
      />

      {/* --- MODAL DETALLE / COMANDA MESA --- */}
      <TableModal
        table={selectedTable}
        isOpen={isTableModalOpen}
        onClose={() => {
          setIsTableModalOpen(false);
          setSelectedTable(null);
        }}
        menuItems={menuItems}
        categories={categories}
        onOpenTable={handleOpenTable}
        onUpdateOrder={handleUpdateOrder}
        onCloseTable={handleCloseTable}
      />
    </div>
  );
};