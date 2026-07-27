// src/components/tables/TableModal.tsx
import React, { useState } from 'react';
import type { Table, MenuItem, OrderItem } from '../../types/restaurant';
import { CheckoutModal } from './CheckoutModal';

interface TableModalProps {
  table: Table | null;
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
  categories: string[];
  onOpenTable: (tableId: string) => void;
  onUpdateOrder: (tableId: string, items: OrderItem[]) => void;
  onCloseTable: (tableId: string) => void; // Callback para liberar la mesa
}

export const TableModal: React.FC<TableModalProps> = ({
  table,
  isOpen,
  onClose,
  menuItems,
  categories,
  onOpenTable,
  onUpdateOrder,
  onCloseTable,
}) => {
  if (!isOpen || !table) return null;

  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentItems, setCurrentItems] = useState<OrderItem[]>(
    table.currentOrder?.items || []
  );
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);

  const filteredMenuItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === 'Todas' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddItem = (item: MenuItem) => {
    setCurrentItems((prev) => {
      const existing = prev.find((i) => i.menuItem.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.menuItem.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setCurrentItems((prev) =>
      prev
        .map((i) => {
          if (i.menuItem.id === itemId) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as OrderItem[]
    );
  };

  const handleSaveOrder = () => {
    onUpdateOrder(table.id, currentItems);
    onClose();
  };

  const handleConfirmPayment = (tableId: string) => {
    onCloseTable(tableId);
    onClose();
  };

  const totalAmount = currentItems.reduce(
    (acc, item) => acc + item.menuItem.price * item.quantity,
    0
  );

  return (
    <>
      <div className="fixed inset-0 z-40 flex justify-end bg-black/40 backdrop-blur-xs">
        <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Mesa {table.number}</h2>
              <p className="text-sm text-gray-500">
                Estado: <span className="font-semibold uppercase">{table.status}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 text-2xl font-bold rounded-lg"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          {table.status === 'AVAILABLE' && currentItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-2xl mb-4 font-bold">
                ✓
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">La mesa está libre</h3>
              <p className="text-sm text-gray-500 mb-6 max-w-sm">
                Abre la mesa para empezar a añadir platos y tomar el pedido.
              </p>
              <button
                onClick={() => onOpenTable(table.id)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-2.5 rounded-lg shadow-sm transition-colors"
              >
                Abrir Mesa / Crear Pedido
              </button>
            </div>
          ) : (
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
              {/* Lista Consumos */}
              <div className="w-full md:w-1/2 p-4 border-r border-gray-200 overflow-y-auto flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-gray-700 mb-3 text-base">Pedido Actual</h3>
                  {currentItems.length === 0 ? (
                    <p className="text-sm text-gray-400 italic text-center py-8">
                      No hay ítems seleccionados
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {currentItems.map((item) => (
                        <div
                          key={item.menuItem.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex-1 pr-2">
                            <p className="text-sm font-medium text-gray-800">
                              {item.menuItem.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              S/ {item.menuItem.price.toFixed(2)} c/u
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleUpdateQuantity(item.menuItem.id, -1)}
                              className="w-7 h-7 bg-white border border-gray-300 text-gray-700 rounded-md flex items-center justify-center font-bold hover:bg-gray-100"
                            >
                              -
                            </button>
                            <span className="text-sm font-semibold w-5 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleUpdateQuantity(item.menuItem.id, 1)}
                              className="w-7 h-7 bg-white border border-gray-300 text-gray-700 rounded-md flex items-center justify-center font-bold hover:bg-gray-100"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Total + Botón de Cobro */}
                <div className="pt-4 border-t border-gray-200 mt-4 space-y-3">
                  <div className="flex justify-between items-center text-lg font-bold text-gray-900">
                    <span>Total:</span>
                    <span>S/ {totalAmount.toFixed(2)}</span>
                  </div>

                  {currentItems.length > 0 && (
                    <button
                      onClick={() => setIsCheckoutOpen(true)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg shadow-sm transition-colors text-sm flex items-center justify-center gap-2"
                    >
                      💳 Procesar Cuenta / Cobrar
                    </button>
                  )}
                </div>
              </div>

              {/* Catálogo */}
              <div className="w-full md:w-1/2 p-4 flex flex-col bg-gray-50/50 overflow-y-auto">
                <h3 className="font-bold text-gray-700 mb-3 text-base">Añadir Platos</h3>
                <input
                  type="text"
                  placeholder="Buscar plato..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none">
                  {['Todas', ...categories].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1 rounded-full text-xs whitespace-nowrap font-medium transition-colors ${
                        selectedCategory === cat
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="space-y-2 flex-1 overflow-y-auto">
                  {filteredMenuItems.map((menuItem) => (
                    <div
                      key={menuItem.id}
                      onClick={() => handleAddItem(menuItem)}
                      className="p-2.5 bg-white border border-gray-200 rounded-lg flex justify-between items-center cursor-pointer hover:border-blue-400 hover:shadow-xs transition-all"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-800">{menuItem.name}</p>
                        <p className="text-xs text-gray-500">S/ {menuItem.price.toFixed(2)}</p>
                      </div>
                      <button className="text-blue-600 font-bold text-lg px-2 hover:bg-blue-50 rounded">
                        +
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          {(table.status !== 'AVAILABLE' || currentItems.length > 0) && (
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveOrder}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm"
              >
                Guardar Pedido
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Modal de Pago / Cierre */}
      <CheckoutModal
        table={{ ...table, currentOrder: { ...table.currentOrder!, items: currentItems } }}
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onConfirmPayment={handleConfirmPayment}
      />
    </>
  );
};