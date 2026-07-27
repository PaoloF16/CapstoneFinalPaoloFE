// src/pages/TablesDashboard.tsx
import React, { useEffect, useState } from 'react';
import { getTables, createTable } from '../services/restaurantService';
import type { RestaurantTable } from '../types/restaurant';

export const TablesDashboard: React.FC = () => {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar mesas desde Spring Boot
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

  // Crear mesa de prueba rápidamente
  const handleAddSampleTable = async () => {
    try {
      const nextNumber = tables.length + 1;
      await createTable({
        tableNumber: nextNumber,
        capacity: 4,
        status: 'AVAILABLE',
      } as RestaurantTable);
      await fetchTables();
    } catch (err) {
      console.error('Error al crear mesa:', err);
      alert('Error al crear la mesa en la base de datos.');
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-400 font-medium">
        Cargando salón y mesas...
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header de la vista */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Mapa de Mesas</h1>
          <p className="text-sm text-gray-500">Gestión en tiempo real del salón</p>
        </div>
        <button
          onClick={handleAddSampleTable}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-lg shadow-sm transition-colors flex items-center gap-2"
        >
          + Agregar Mesa
        </button>
      </div>

      {/* Alerta de Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex justify-between items-center">
          <span>⚠️ {error}</span>
          <button
            onClick={fetchTables}
            className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Grilla de Mesas o Mensaje de Estado Vacío */}
      {!error && tables.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-gray-200 shadow-xs max-w-lg mx-auto mt-8">
          <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center text-2xl mx-auto mb-4 font-bold">
            🪑
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">No hay mesas registradas</h3>
          <p className="text-sm text-gray-500 mb-6">
            La base de datos no contiene mesas en este momento. Haz clic en el botón para agregar la primera mesa.
          </p>
          <button
            onClick={handleAddSampleTable}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg shadow-sm transition-colors"
          >
            + Crear Mesa #1
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {tables.map((table) => (
            <div
              key={table.id}
              className={`p-5 rounded-2xl border transition-all shadow-xs hover:shadow-md cursor-pointer ${
                table.status === 'AVAILABLE'
                  ? 'bg-emerald-50/50 border-emerald-200 hover:border-emerald-400'
                  : table.status === 'OCCUPIED'
                  ? 'bg-rose-50/50 border-rose-200 hover:border-rose-400'
                  : 'bg-amber-50/50 border-amber-200 hover:border-amber-400'
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
              <p className="text-xs text-gray-500">
                Capacidad: <strong className="text-gray-700">{table.capacity} personas</strong>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};