import React, { useState } from 'react';

interface CreateTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (tableNumber: number, capacity: number) => Promise<void>;
  suggestedTableNumber: number;
}

export const CreateTableModal: React.FC<CreateTableModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  suggestedTableNumber,
}) => {
  const [tableNumber, setTableNumber] = useState<number>(suggestedTableNumber);
  const [capacity, setCapacity] = useState<number>(4);
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await onSubmit(tableNumber, capacity);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-1">Agregar Nueva Mesa</h3>
        <p className="text-xs text-gray-500 mb-4">Ingresa la información básica de la mesa</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
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
            <label className="block text-xs font-bold text-gray-700 mb-1">
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

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
            >
              {loading ? 'Guardando...' : 'Crear Mesa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};