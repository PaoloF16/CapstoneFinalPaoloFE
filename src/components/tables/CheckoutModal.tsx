// src/components/tables/CheckoutModal.tsx
import React, { useState } from 'react';
import type { Table } from '../../types/restaurant';

interface CheckoutModalProps {
  table: Table | null;
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
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [discountCode, setDiscountCode] = useState<string>('');
  const [codeApplied, setCodeApplied] = useState<boolean>(false);
  const [codeError, setCodeError] = useState<string>('');

  if (!isOpen || !table || !table.currentOrder) return null;

  const items = table.currentOrder.items;

  // Cálculos dinámicos
  const subtotal = items.reduce(
    (acc, item) => acc + item.menuItem.price * item.quantity,
    0
  );

  const discountAmount = (subtotal * discountPercent) / 100;
  const totalToPay = Math.max(0, subtotal - discountAmount);

  // Aplicar código de descuento manual (ej: PROMO10 o VIP20)
  const handleApplyCode = () => {
    setCodeError('');
    const cleanCode = discountCode.trim().toUpperCase();

    if (cleanCode === 'PROMO10' || cleanCode === 'DESC10') {
      setDiscountPercent(10);
      setCodeApplied(true);
    } else if (cleanCode === 'VIP20') {
      setDiscountPercent(20);
      setCodeApplied(true);
    } else {
      setCodeError('Código no válido (Prueba: PROMO10 o VIP20)');
    }
  };

  const handleConfirm = () => {
    onConfirmPayment(table.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gray-900 text-white flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold">Cierre de Cuenta — Mesa {table.number}</h3>
            <p className="text-xs text-gray-400">Resumen y procesamiento de pago</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white font-bold text-xl"
          >
            ✕
          </button>
        </div>

        {/* Detalle de Ítems */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="border-b border-gray-100 pb-3">
            <p className="text-xs font-bold text-gray-500 uppercase mb-2">Detalle del Consumo</p>
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.menuItem.id} className="flex justify-between text-xs">
                  <span className="text-gray-700">
                    <strong className="font-semibold">{item.quantity}x</strong> {item.menuItem.name}
                  </span>
                  <span className="font-medium text-gray-900">
                    S/ {(item.menuItem.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Sección de Descuento */}
          <div className="space-y-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
            <label className="block text-xs font-bold text-gray-700">
              Aplicar Descuento
            </label>
            
            {/* Porcentaje manual */}
            <div className="flex gap-2 items-center">
              <span className="text-xs text-gray-500">% Descuento:</span>
              <input
                type="number"
                min="0"
                max="100"
                value={discountPercent || ''}
                onChange={(e) => {
                  setCodeApplied(false);
                  setDiscountPercent(Math.min(100, Math.max(0, Number(e.target.value))));
                }}
                placeholder="Ej. 10"
                className="w-20 px-2 py-1 border border-gray-300 rounded text-xs text-center focus:ring-1 focus:ring-red-500 focus:outline-none"
              />
              <span className="text-xs text-gray-500">%</span>
            </div>

            {/* Código promocional */}
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="Código (ej. PROMO10)"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                className="flex-1 px-2.5 py-1 border border-gray-300 rounded text-xs uppercase focus:ring-1 focus:ring-red-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleApplyCode}
                className="px-3 py-1 bg-gray-800 text-white rounded text-xs font-semibold hover:bg-black transition-colors"
              >
                Aplicar
              </button>
            </div>

            {codeApplied && (
              <p className="text-[11px] text-emerald-600 font-medium">✓ Código aplicado correctamente</p>
            )}
            {codeError && (
              <p className="text-[11px] text-red-500 font-medium">{codeError}</p>
            )}
          </div>

          {/* Totales */}
          <div className="space-y-1.5 pt-2 text-xs border-t border-gray-100">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span>S/ {subtotal.toFixed(2)}</span>
            </div>
            {discountPercent > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Descuento ({discountPercent}%):</span>
                <span>- S/ {discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-extrabold text-gray-900 pt-2 border-t border-gray-200">
              <span>Total a Pagar:</span>
              <span className="text-red-600">S/ {totalToPay.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
          >
            Confirmar Pago
          </button>
        </div>

      </div>
    </div>
  );
};