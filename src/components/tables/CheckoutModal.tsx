// src/components/tables/CheckoutModal.tsx
import React, { useState } from 'react';
import type { RestaurantTable as Table, Order } from '../../types/restaurant';
import { checkoutOrder } from '../../services/restaurantService';
import { useRestaurant } from '../../context/RestaurantContext'; // 👈 Importamos Contexto

type ExtendedTable = Table & {
  currentOrder?: Order;
};

interface CheckoutModalProps {
  table: ExtendedTable | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmPayment: (tableId: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  table,
  isOpen,
  onClose,
  onConfirmPayment,
}) => {
  const { settings } = useRestaurant(); // 👈 Moneda dinámica
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'TRANSFER'>('CASH');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen || !table) return null;

  const items = table.currentOrder?.items || [];
  const subtotal = items.reduce(
    (acc, item) => acc + (item.product?.price || item.unitPrice || 0) * item.quantity,
    0
  );

  const discountAmount = (subtotal * discountPercent) / 100;
  const total = Math.max(0, subtotal - discountAmount);

 const handleCheckout = async () => {
    try {
      setLoading(true);
      await checkoutOrder(table.id, {
        paymentMethod,
        discountValue: discountPercent,
        discountType: discountPercent > 0 ? 'PERCENTAGE' : undefined, // 👈 CORREGIDO: undefined en lugar de 'NONE'
      });
      onConfirmPayment(table.id);
    } catch (err) {
      console.error('Error al procesar cobro:', err);
      alert('Error al registrar el cobro de la mesa.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 bg-gray-900 text-white flex justify-between items-center">
          <div>
            <h3 className="font-black text-lg">Cobro de Mesa #{table.tableNumber}</h3>
            <p className="text-xs text-gray-400">{settings.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Cuerpo */}
        <div className="p-6 space-y-5">
          
          {/* Resumen de Cuenta */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal ({items.length} productos):</span>
              <span className="font-semibold">{settings.currency} {subtotal.toFixed(2)}</span>
            </div>

            {discountPercent > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Descuento ({discountPercent}%):</span>
                <span>- {settings.currency} {discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="pt-2 border-t border-gray-200 flex justify-between items-center text-lg font-black text-gray-900">
              <span>Total a Pagar:</span>
              <span className="text-red-600 text-xl font-black">
                {settings.currency} {total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Selector de Descuento Rápido */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
              Aplicar Descuento
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[0, 5, 10, 15].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setDiscountPercent(pct)}
                  className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    discountPercent === pct
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {pct === 0 ? 'Sin Dcto' : `${pct}%`}
                </button>
              ))}
            </div>
          </div>

          {/* Método de Pago */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
              Método de Pago
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('CASH')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1 font-bold text-xs transition-all cursor-pointer ${
                  paymentMethod === 'CASH'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg">💵</span>
                <span>Efectivo</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CARD')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1 font-bold text-xs transition-all cursor-pointer ${
                  paymentMethod === 'CARD'
                    ? 'border-blue-500 bg-blue-50 text-blue-800 shadow-sm'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg">💳</span>
                <span>Tarjeta</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('TRANSFER')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1 font-bold text-xs transition-all cursor-pointer ${
                  paymentMethod === 'TRANSFER'
                    ? 'border-purple-500 bg-purple-50 text-purple-800 shadow-sm'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg">📱</span>
                <span>Transferencia</span>
              </button>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="pt-3 border-t border-gray-100 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-3 border border-gray-300 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleCheckout}
              disabled={loading}
              className="w-2/3 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Procesando...' : `Cobrar ${settings.currency} ${total.toFixed(2)}`}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};