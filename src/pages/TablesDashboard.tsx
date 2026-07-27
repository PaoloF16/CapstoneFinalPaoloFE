// src/pages/TablesDashboard.tsx
import React, { useEffect, useState } from 'react';
import {
  getTables,
  createTable,
  createOrder,
  getActiveOrderByTable,
  updateOrderItems,
} from '../services/restaurantService';
import { menuService } from '../services/menuService';
import { TableModal } from '../components/tables/TableModal';
import { CreateTableModal } from '../components/tables/CreateTableModal';
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
  // --- ESTADOS LOCALES ---
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal para agregar mesa
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  // Modal para ver comanda de mesa
  const [selectedTable, setSelectedTable] = useState<ExtendedTable | null>(null);
  const [isTableModalOpen, setIsTableModalOpen] = useState<boolean>(false);

  // Catálogo de productos y categorías para el pedido
  const [menuItems, setMenuItems] = useState<LocalMenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  // --- CARGA DE DATOS DESDE EL BACKEND ---
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

  // --- MANEJADOR DE CLIC EN UNA MESA ---
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

  // --- CREAR NUEVA MESA ---
  const handleCreateTableSubmit = async (tableNumber: number, capacity: number) => {
    await createTable({
      tableNumber,
      capacity,
      status: 'AVAILABLE',
    } as RestaurantTable);
    await fetchTables();
  };

  // --- ACCIONES EN LA COMANDA DE LA MESA ---
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

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-400 font-medium">
        Cargando salón y mesas...
      </div>
    );
  }

  return (
    <div className="p-6">
      
      {/* --- ENCABEZADO --- */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Mapa del Salón / Mesas</h1>
          <p className="text-sm text-gray-500">Gestión de comandas y mesas en tiempo real</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-2"
        >
          + Agregar Mesa
        </button>
      </div>

      {/* --- ALERTA ERROR --- */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex justify-between items-center">
          <span>⚠️ {error}</span>
          <button
            onClick={fetchTables}
            className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-700 cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* --- GRILLA DE MESAS --- */}
      {!error && tables.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-gray-200 shadow-xs max-w-lg mx-auto mt-8">
          <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center text-2xl mx-auto mb-4 font-bold">
            🪑
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">No hay mesas registradas</h3>
          <p className="text-sm text-gray-500 mb-6">
            Agrega la primera mesa para comenzar a tomar pedidos.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            + Crear Mesa #1
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {tables.map((table) => (
            <div
              key={table.id}
              onClick={() => handleSelectTable(table)}
              className={`p-5 rounded-2xl border transition-all shadow-xs hover:shadow-md cursor-pointer ${
                table.status === 'AVAILABLE'
                  ? 'bg-emerald-50/60 border-emerald-200 hover:border-emerald-500'
                  : table.status === 'OCCUPIED'
                  ? 'bg-rose-50/60 border-rose-200 hover:border-rose-500'
                  : 'bg-amber-50/60 border-amber-200 hover:border-amber-500'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold text-gray-800">
                  Mesa #{table.tableNumber}
                </h3>
                <span
                  className={`px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-full ${
                    table.status === 'AVAILABLE'
                      ? 'bg-emerald-100 text-emerald-800'
                      : table.status === 'OCCUPIED'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {table.status === 'AVAILABLE'
                    ? 'Libre'
                    : table.status === 'OCCUPIED'
                    ? 'Ocupada'
                    : 'Esperando'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Capacidad: <strong className="text-gray-700">{table.capacity} personas</strong></span>
                <span className="text-emerald-700 font-bold hover:underline">Ver comanda →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- MODAL AGREGAR MESA --- */}
      <CreateTableModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTableSubmit}
        suggestedTableNumber={tables.length + 1}
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