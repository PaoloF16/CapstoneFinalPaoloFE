// src/components/tables/TableCard.tsx

import React from 'react';
import type { Table, TableStatus } from '../../types/restaurant';

interface TableCardProps {
  table: Table;
  onClick: (table: Table) => void;
}

const statusConfig: Record<TableStatus, { bg: string; text: string; label: string; border: string }> = {
  AVAILABLE: {
    bg: 'bg-emerald-50 hover:bg-emerald-100',
    text: 'text-emerald-700',
    border: 'border-emerald-300',
    label: 'Libre',
  },
  OCCUPIED: {
    bg: 'bg-rose-50 hover:bg-rose-100',
    text: 'text-rose-700',
    border: 'border-rose-300',
    label: 'Ocupada',
  },
  WAITING: {
    bg: 'bg-amber-50 hover:bg-amber-100',
    text: 'text-amber-700',
    border: 'border-amber-300',
    label: 'Esperando',
  },
};

export const TableCard: React.FC<TableCardProps> = ({ table, onClick }) => {
  const config = statusConfig[table.status];
  const totalItems = table.currentOrder?.items.reduce((acc, item) => acc + item.quantity, 0) || 0;
  const totalAmount = table.currentOrder?.items.reduce((acc, item) => acc + item.menuItem.price * item.quantity, 0) || 0;

  return (
    <div
      onClick={() => onClick(table)}
      className={`cursor-pointer rounded-xl border-2 p-5 shadow-sm transition-all duration-200 hover:shadow-md ${config.bg} ${config.border}`}
    >
      {/* Header Card */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xl font-bold text-gray-800">Mesa {table.number}</span>
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${config.text} bg-white shadow-xs`}>
          {config.label}
        </span>
      </div>

      {/* Info Content */}
      <div className="space-y-1 text-sm text-gray-600">
        <p className="flex items-center gap-1">
          <span className="font-medium">Capacidad:</span> {table.capacity} personas
        </p>
        
        {table.status !== 'AVAILABLE' && table.currentOrder && (
          <>
            <p className="flex items-center gap-1">
              <span className="font-medium">Ítems:</span> {totalItems}
            </p>
            <p className="text-base font-bold text-gray-900 pt-2 border-t border-gray-200/60 mt-2">
              S/ {totalAmount.toFixed(2)}
            </p>
          </>
        )}
      </div>
    </div>
  );
};