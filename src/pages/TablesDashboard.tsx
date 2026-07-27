// src/pages/TablesDashboard.tsx
import React, { useState } from 'react';
import type { Table, MenuItem, OrderItem } from '../types/restaurant';
import { TableCard } from '../components/tables/TableCard';
import { TableModal } from '../components/tables/TableModal';

const MOCK_CATEGORIES = ['Entradas', 'Fondos', 'Bebidas', 'Postres'];

const MOCK_MENU: MenuItem[] = [
  { id: 'm1', name: 'Ceviche Clásico', price: 32.0, category: 'Entradas' },
  { id: 'm2', name: 'Causa Rellena', price: 22.0, category: 'Entradas' },
  { id: 'm3', name: 'Lomo Saltado', price: 45.0, category: 'Fondos' },
  { id: 'm4', name: 'Arroz con Mariscos', price: 42.0, category: 'Fondos' },
  { id: 'm5', name: 'Chicha Morada 1L', price: 15.0, category: 'Bebidas' },
  { id: 'm6', name: 'Inca Kola 500ml', price: 6.0, category: 'Bebidas' },
  { id: 'm7', name: 'Suspiro a la Limeña', price: 18.0, category: 'Postres' },
];

const MOCK_TABLES: Table[] = [
  { id: 't1', number: 1, capacity: 2, status: 'AVAILABLE' },
  {
    id: 't2',
    number: 2,
    capacity: 4,
    status: 'OCCUPIED',
    currentOrder: {
      id: 'o1',
      createdAt: '2026-07-27T12:00:00',
      items: [
        { menuItem: MOCK_MENU[0], quantity: 1 },
        { menuItem: MOCK_MENU[4], quantity: 1 },
      ],
    },
  },
  {
    id: 't3',
    number: 3,
    capacity: 6,
    status: 'WAITING',
    currentOrder: {
      id: 'o2',
      createdAt: '2026-07-27T12:15:00',
      items: [{ menuItem: MOCK_MENU[2], quantity: 2 }],
    },
  },
  { id: 't4', number: 4, capacity: 2, status: 'AVAILABLE' },
  { id: 't5', number: 5, capacity: 4, status: 'AVAILABLE' },
  { id: 't6', number: 6, capacity: 8, status: 'OCCUPIED' },
];

export const TablesDashboard: React.FC = () => {
  const [tables, setTables] = useState<Table[]>(MOCK_TABLES);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleTableClick = (table: Table) => {
    setSelectedTable(table);
    setIsModalOpen(true);
  };

  const handleOpenTable = (tableId: string) => {
    const updatedOrder = {
      id: `order-${Date.now()}`,
      items: [],
      createdAt: new Date().toISOString(),
    };

    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId ? { ...t, status: 'OCCUPIED', currentOrder: updatedOrder } : t
      )
    );

    setSelectedTable((prev) =>
      prev && prev.id === tableId
        ? { ...prev, status: 'OCCUPIED', currentOrder: updatedOrder }
        : prev
    );
  };

  const handleUpdateOrder = (tableId: string, updatedItems: OrderItem[]) => {
    setTables((prev) =>
      prev.map((t) => {
        if (t.id === tableId) {
          const newStatus = updatedItems.length > 0 ? 'OCCUPIED' : 'AVAILABLE';
          return {
            ...t,
            status: newStatus,
            currentOrder:
              updatedItems.length > 0
                ? {
                    id: t.currentOrder?.id || `order-${Date.now()}`,
                    items: updatedItems,
                    createdAt: t.currentOrder?.createdAt || new Date().toISOString(),
                  }
                : undefined,
          };
        }
        return t;
      })
    );
  };

  // Liberar mesa al realizar el pago (Vuelve a Verde/AVAILABLE)
  const handleCloseTable = (tableId: string) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? {
              ...t,
              status: 'AVAILABLE',
              currentOrder: undefined,
            }
          : t
      )
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard de Mesas</h1>
          <p className="text-sm text-gray-500">Gestión de estados y toma de pedidos en tiempo real</p>
        </div>

        <div className="flex items-center gap-4 bg-white p-3 rounded-lg border border-gray-200 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            Verde = Libre
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
            <span className="w-3 h-3 rounded-full bg-rose-500"></span>
            Rojo = Ocupada
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            Amarillo = Esperando
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {tables.map((table) => (
          <TableCard key={table.id} table={table} onClick={handleTableClick} />
        ))}
      </div>

      <TableModal
        table={selectedTable}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        menuItems={MOCK_MENU}
        categories={MOCK_CATEGORIES}
        onOpenTable={handleOpenTable}
        onUpdateOrder={handleUpdateOrder}
        onCloseTable={handleCloseTable}
      />
    </div>
  );
};