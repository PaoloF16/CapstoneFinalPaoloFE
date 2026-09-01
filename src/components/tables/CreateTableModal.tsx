// src/components/tables/CreateTableModal.tsx
import React, { useState, useEffect } from 'react';
import type { RestaurantTable } from '../../types/restaurant';

interface CreateTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (tableNumber: number, capacity: number) => Promise<void>;
  suggestedTableNumber: number;
  initialData?: RestaurantTable | null;
}

export const CreateTableModal: React.FC<CreateTableModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  suggestedTableNumber,
  initialData,
}) => {
  // --- ESTADOS LOCALES ---
  const [tableNumber, setTableNumber] = useState<number>(suggestedTableNumber);
  const [capacity, setCapacity] = useState<number>(4);
  const [loading, setLoading] = useState<boolean>(false);

  // --- RELLENAR DATOS EN MODO EDICIÓN ---
  useEffect(() => {
    if (initialData) {
      setTableNumber(initialData.tableNumber);
      setCapacity(initialData.capacity);
    } else {
      setTableNumber(suggestedTableNumber);
      setCapacity(4);
    }
  }, [initialData, suggestedTableNumber, isOpen]);

  if (!isOpen) return null;

  // --- MANEJADOR DE ENVÍO ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await onSubmit(tableNumber, capacity);
      onClose();
    } catch (err) {
      console.error('Error al guardar la mesa:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* --- HEADER --- */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">
            {initialData ? 'Editar Mesa' : 'Agregar Nueva Mesa'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 font-bold text-xl cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* --- FORMULARIO --- */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">
              Número de Mesa
            </label>
            <input
              type="number"
              min="1"
              required
              value={tableNumber}
              onChange={(e) => setTableNumber(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">
              Capacidad (N° de Personas)
            </label>
            <input
              type="number"
              min="1"
              max="30"
              required
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* --- ACCIONES --- */}
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Guardando...' : initialData ? 'Actualizar Mesa' : 'Crear Mesa'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};