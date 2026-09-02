// src/pages/KitchenDisplayPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  getKitchenOrders,
  updateOrderStatus,
} from '../services/restaurantService';
import type { Order, OrderStatus } from '../types/restaurant';
import { useRestaurant } from '../context/RestaurantContext';
import { useLanguage } from '../context/LanguageContext';

const playKitchenAlertSound = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {
    console.log('Audio no interactuado aún');
  }
};

export const KitchenDisplayPage: React.FC = () => {
  const { settings } = useRestaurant();
  const { t } = useLanguage();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'IN_PREPARATION'>('ALL');

  const previousOrdersCount = useRef<number>(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchOrders = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const data = await getKitchenOrders();
      const kitchenList = Array.isArray(data) ? data : [];

      if (!isInitial && soundEnabled && kitchenList.length > previousOrdersCount.current) {
        playKitchenAlertSound();
      }

      previousOrdersCount.current = kitchenList.length;
      setOrders(kitchenList);
    } catch (error) {
      console.error('Error en polling de cocina:', error);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(true);
    const interval = setInterval(() => fetchOrders(false), 5000);
    return () => clearInterval(interval);
  }, [soundEnabled]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    if (newStatus === 'READY' || newStatus === 'DELIVERED') {
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } else {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    }

    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (err) {
      console.error('Error al actualizar comanda en cocina:', err);
    }
  };

  const getElapsedMinutes = (dateString?: string) => {
    if (!dateString) return 0;
    const diffMs = currentTime.getTime() - new Date(dateString).getTime();
    return Math.max(0, Math.floor(diffMs / 60000));
  };

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === 'ALL') return true;
    return o.status === filterStatus;
  });

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0f14] text-gray-100 flex flex-col font-sans select-none overflow-hidden">
      {/* HEADER KDS (GRAFITO OSCURO) */}
      <header className="bg-[#12151d] border-b border-gray-800 px-6 py-3 flex justify-between items-center shrink-0 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 bg-orange-500 rounded-full animate-pulse shadow-md shadow-orange-500/50" />
            <h1 className="text-xl font-black tracking-wider text-white flex items-center gap-2">
              <span>👨‍🍳 KDS</span>
              <span className="text-orange-400 text-xs font-black uppercase bg-orange-950/40 px-2 py-0.5 rounded-lg border border-orange-500/30">
                {settings.name}
              </span>
            </h1>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 bg-[#0a0c10] p-1 rounded-2xl border border-gray-800 text-xs">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                filterStatus === 'ALL'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {t('kitchen.allTab', 'Todos')} ({orders.length})
            </button>
            <button
              onClick={() => setFilterStatus('PENDING')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                filterStatus === 'PENDING'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {t('kitchen.pendingTab', 'Pendientes')} ({orders.filter((o) => o.status === 'PENDING').length})
            </button>
            <button
              onClick={() => setFilterStatus('IN_PREPARATION')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                filterStatus === 'IN_PREPARATION'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {t('kitchen.inPrepTab', 'En Marcha')} ({orders.filter((o) => o.status === 'IN_PREPARATION').length})
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              soundEnabled
                ? 'bg-orange-950/40 border-orange-500/40 text-orange-400'
                : 'bg-gray-800/40 border-gray-700 text-gray-500'
            }`}
          >
            <span>{soundEnabled ? `🔔 ${t('kitchen.alarmOn', 'Alarma ON')}` : `🔕 ${t('kitchen.alarmOff', 'Silencio')}`}</span>
          </button>

          <button
            onClick={toggleFullScreen}
            className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-bold border border-gray-700 cursor-pointer"
            title="Pantalla Completa"
          >
            ⛶
          </button>

          <div className="text-right pl-3 border-l border-gray-800">
            <span className="text-[10px] text-gray-400 font-bold uppercase block">
              {t('kitchen.hallTime', 'Hora Salón')}
            </span>
            <span className="text-base font-black text-white font-mono leading-none">
              {currentTime.toLocaleTimeString()}
            </span>
          </div>
        </div>
      </header>

      {/* CONTENEDOR DE TARJETAS BLANCAS */}
      <main className="flex-1 p-6 overflow-x-auto overflow-y-auto">
        {loading ? (
          <div className="h-full flex items-center justify-center text-orange-400 font-bold text-base">
            {t('common.loading', 'Conectando con comandas de cocina...')}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-gray-900/60 border border-gray-800 rounded-full flex items-center justify-center text-3xl mb-4 shadow-inner">
              🍳
            </div>
            <h2 className="text-xl font-bold text-gray-200">{t('kitchen.allCaughtUp', '¡Cocina al día!')}</h2>
            <p className="text-sm text-gray-500 mt-1 max-w-sm">
              {t('kitchen.noOrders', 'No hay comandas pendientes en este momento. Las nuevas órdenes ingresarán automáticamente.')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 items-start">
            {filteredOrders.map((order) => {
              const elapsed = getElapsedMinutes(order.createdAt);
              const isUrgent = elapsed >= 20;
              const isWarning = elapsed >= 10 && elapsed < 20;
              const isPending = order.status === 'PENDING';
              const isTakeaway = order.table?.tableNumber === 999;

              return (
                <div
                  key={order.id}
                  className={`bg-white text-gray-900 border-2 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between transition-all ${
                    isUrgent
                      ? 'border-rose-500 shadow-rose-900/20'
                      : isWarning
                      ? 'border-amber-400 shadow-amber-900/15'
                      : 'border-gray-200'
                  }`}
                >
                  {/* Header de la Tarjeta */}
                  <div
                    className={`p-4 flex justify-between items-center border-b ${
                      isUrgent
                        ? 'bg-rose-50 border-rose-100 text-rose-900'
                        : isWarning
                        ? 'bg-amber-50 border-amber-100 text-amber-900'
                        : 'bg-gray-50 border-gray-100 text-gray-900'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] text-gray-500 font-extrabold uppercase tracking-wider block">
                        {isTakeaway ? '🛍️ TAKEAWAY' : `${t('kitchen.table', 'Mesa')} #${order.table?.tableNumber || '?'}`}
                      </span>
                      <h3 className="text-2xl font-black text-gray-900">
                        {isTakeaway ? 'LLEVAR' : `#${order.table?.tableNumber || '?'}`}
                      </h3>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-xs font-mono font-black px-2.5 py-1 rounded-xl inline-block ${
                          isUrgent
                            ? 'bg-rose-600 text-white animate-pulse'
                            : isWarning
                            ? 'bg-amber-400 text-gray-950 font-bold'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        ⏱️ {elapsed} min
                      </span>
                      <span className="text-[10px] text-gray-500 block mt-1 uppercase font-bold">
                        {isPending ? `🔴 ${t('kitchen.pending', 'Pendiente')}` : `🔵 ${t('kitchen.inPrep', 'En Marcha')}`}
                      </span>
                    </div>
                  </div>

                  {/* Lista de Platos */}
                  <div className="p-4 space-y-3 divide-y divide-gray-100 max-h-80 overflow-y-auto">
                    {order.items?.map((item) => (
                      <div
                        key={item.id || item.product?.id}
                        className="pt-2 first:pt-0 flex items-start gap-3"
                      >
                        <span className="bg-orange-500 text-white font-black text-sm px-2 py-0.5 rounded-lg shrink-0 mt-0.5">
                          {item.quantity}x
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-900 leading-tight">
                            {item.product?.name}
                          </p>
                          {item.product?.isGlutenFree && (
                            <span className="text-[9px] bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.5 rounded-md mt-1 inline-block">
                              ⚠️ SIN GLUTEN
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Botones de Acción */}
                  <div className="p-3 bg-gray-50 border-t border-gray-100 flex flex-col gap-2">
                    {isPending ? (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(order.id, 'IN_PREPARATION')}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-black text-xs rounded-2xl uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-md shadow-blue-600/20"
                      >
                        👨‍🍳 {t('kitchen.startPrep', 'Empezar a Cocinar')}
                      </button>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => handleStatusChange(order.id, 'READY')}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-xs rounded-2xl uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5"
                    >
                      
                      <span>{t('kitchen.markReady', 'MARCAR COMO LISTO')}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default KitchenDisplayPage;