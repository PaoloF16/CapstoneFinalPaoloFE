// src/pages/mobile/MobileTablesPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTables } from '../../services/restaurantService';
import type { RestaurantTable } from '../../types/restaurant';

export const MobileTablesPage: React.FC = () => {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'AVAILABLE' | 'OCCUPIED'>('ALL');
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const storedUser = localStorage.getItem('pos_user');
  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  const loadTables = async () => {
    try {
      setLoading(true);
      const data = await getTables();
      setTables(data);
    } catch (err) {
      console.error('Error al cargar mesas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTables();
  }, []);

  const filteredTables = tables.filter((t) => {
    if (filter === 'ALL') return true;
    return t.status === filter;
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col font-sans pb-6">
      {/* Top Bar Móvil */}
      <div className="p-4 bg-gray-900 border-b border-gray-800 flex justify-between items-center sticky top-0 z-20">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-red-500 font-extrabold block">
            Salón de Mesas
          </span>
          <h2 className="text-base font-bold text-gray-100">
            Mesero: <span className="text-white font-black">{currentUser?.name || 'Garzón'}</span>
          </h2>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem('pos_user');
            navigate('/mobile/login');
          }}
          className="px-3 py-1.5 bg-gray-800 border border-gray-700 text-red-400 text-xs font-bold rounded-xl active:scale-95"
        >
          Salir
        </button>
      </div>

      {/* Selector de Filtro */}
      <div className="p-3 bg-gray-900/60 border-b border-gray-800/80 flex gap-2 overflow-x-auto">
        <button
          onClick={() => setFilter('ALL')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-colors ${
            filter === 'ALL' ? 'bg-red-600 text-white shadow-md' : 'bg-gray-900 text-gray-400 border border-gray-800'
          }`}
        >
          Todas ({tables.length})
        </button>
        <button
          onClick={() => setFilter('AVAILABLE')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-colors ${
            filter === 'AVAILABLE' ? 'bg-emerald-600 text-white shadow-md' : 'bg-gray-900 text-gray-400 border border-gray-800'
          }`}
        >
          Libres ({tables.filter((t) => t.status === 'AVAILABLE').length})
        </button>
        <button
          onClick={() => setFilter('OCCUPIED')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-colors ${
            filter === 'OCCUPIED' ? 'bg-rose-600 text-white shadow-md' : 'bg-gray-900 text-gray-400 border border-gray-800'
          }`}
        >
          Ocupadas ({tables.filter((t) => t.status === 'OCCUPIED').length})
        </button>
      </div>

      {/* Grilla de Mesas Touch */}
      <div className="p-4 flex-1">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Cargando mesas...</div>
        ) : (
          <div className="grid grid-cols-2 gap-3.5">
            {filteredTables.map((table) => {
              const isAvailable = table.status === 'AVAILABLE';
              return (
                <button
                  key={table.id}
                  onClick={() => navigate(`/mobile/order/${table.id}`)}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-28 active:scale-95 transition-all shadow-md cursor-pointer ${
                    isAvailable
                      ? 'bg-emerald-950/20 border-emerald-500/40 hover:border-emerald-500'
                      : 'bg-rose-950/20 border-rose-500/40 hover:border-rose-500'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-2xl font-black text-white">#{table.tableNumber}</span>
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        isAvailable ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {isAvailable ? 'LIBRE' : 'OCUPADA'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-gray-400">
                    <span>👥 {table.capacity}p</span>
                    <span className="text-red-400 font-bold text-xs">Comanda ➔</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};