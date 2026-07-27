// src/components/tables/TableModal.tsx
import React, { useState, useEffect } from 'react';
import type { RestaurantTable as Table, OrderItem, Order } from '../../types/restaurant';
import { CheckoutModal } from './CheckoutModal';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
}

type ExtendedTable = Table & {
  currentOrder?: Order;
};

interface TableModalProps {
  table: ExtendedTable | null;
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
  categories: string[];
  onOpenTable: (tableId: string) => void;
  onUpdateOrder: (tableId: string, items: OrderItem[]) => void;
  onCloseTable: (tableId: string) => void;
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

  // --- ESTADOS LOCALES ---
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentItems, setCurrentItems] = useState<OrderItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [showPrebill, setShowPrebill] = useState<boolean>(false);

  // --- SINCRONIZACIÓN DE ORDEN ACTIVA ---
  useEffect(() => {
    if (table?.currentOrder?.items) {
      setCurrentItems(table.currentOrder.items);
    } else {
      setCurrentItems([]);
    }
  }, [table]);

  // --- FILTRADO DE CATALOGO DE PLATOS ---
  const filteredMenuItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === 'Todas' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // --- MANEJADORES DE ITEMS Y CANTIDADES ---
  const handleAddItem = (item: MenuItem) => {
    setCurrentItems((prev) => {
      const existing = prev.find((i) => i.product.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          product: { id: item.id, name: item.name, price: item.price },
          quantity: 1,
          unitPrice: item.price,
        },
      ];
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCurrentItems((prev) =>
      prev
        .map((i) => {
          if (i.product.id === productId) {
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

  // --- CÁLCULO DE TOTAL ---
  const totalAmount = currentItems.reduce(
    (acc, item) => acc + (item.product?.price || item.unitPrice || 0) * item.quantity,
    0
  );

  return (
    <>
      <div className="fixed inset-0 z-40 flex justify-end bg-black/40 backdrop-blur-xs">
        <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          
          {/* --- CABECERA --- */}
          <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Mesa #{table.tableNumber}</h2>
              <p className="text-sm text-gray-500">
                Capacidad: <strong className="text-gray-700">{table.capacity} pers.</strong> | Estado: <span className="font-semibold uppercase">{table.status}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 text-2xl font-bold rounded-lg cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* --- CUERPO PRINCIPAL --- */}
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
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-2.5 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Abrir Mesa / Crear Pedido
              </button>
            </div>
          ) : (
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
              
              {/* --- LISTA DE CONSUMOS --- */}
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
                          key={item.product.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex-1 pr-2">
                            <p className="text-sm font-medium text-gray-800">
                              {item.product.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              S/ {(item.product.price || item.unitPrice || 0).toFixed(2)} c/u
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleUpdateQuantity(item.product.id, -1)}
                              className="w-7 h-7 bg-white border border-gray-300 text-gray-700 rounded-md flex items-center justify-center font-bold hover:bg-gray-100 cursor-pointer"
                            >
                              -
                            </button>
                            <span className="text-sm font-semibold w-5 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleUpdateQuantity(item.product.id, 1)}
                              className="w-7 h-7 bg-white border border-gray-300 text-gray-700 rounded-md flex items-center justify-center font-bold hover:bg-gray-100 cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* --- TOTAL + BOTONES DE PRECUENTA Y COBRO --- */}
                <div className="pt-4 border-t border-gray-200 mt-4 space-y-3">
                  <div className="flex justify-between items-center text-lg font-bold text-gray-900">
                    <span>Total:</span>
                    <span>S/ {totalAmount.toFixed(2)}</span>
                  </div>

                  {currentItems.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setShowPrebill(true)}
                        className="bg-gray-800 hover:bg-black text-white font-bold py-2.5 rounded-lg shadow-sm transition-colors text-xs flex items-center justify-center gap-1 cursor-pointer"
                      >
                        📄 Precuenta
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsCheckoutOpen(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg shadow-sm transition-colors text-xs flex items-center justify-center gap-1 cursor-pointer"
                      >
                        💳 Cobrar
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* --- CATÁLOGO DE PLATOS PARA AÑADIR --- */}
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
                      className={`px-3 py-1 rounded-full text-xs whitespace-nowrap font-medium transition-colors cursor-pointer ${
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

          {/* --- ACCIONES INFERIORES --- */}
          {(table.status !== 'AVAILABLE' || currentItems.length > 0) && (
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveOrder}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm cursor-pointer"
              >
                Guardar Pedido
              </button>
            </div>
          )}

        </div>
      </div>

      {/* --- MODAL BORRADOR DE PRECUENTA --- */}
      {showPrebill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xs p-6 border border-gray-100 space-y-4">
            <div className="text-center border-b pb-3">
              <h4 className="font-extrabold text-base text-gray-900">TOTEAT RESTAURANT</h4>
              <p className="text-xs text-gray-500">PRECUENTA / COMPROBANTE BORRADOR</p>
              <p className="text-xs font-semibold text-gray-700 mt-1">Mesa #{table.tableNumber}</p>
            </div>
            
            <div className="space-y-1.5 text-xs max-h-48 overflow-y-auto">
              {currentItems.map((item) => (
                <div key={item.product.id} className="flex justify-between">
                  <span>{item.quantity}x {item.product.name}</span>
                  <span className="font-medium">S/ {((item.product.price || item.unitPrice || 0) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-2 flex justify-between font-bold text-sm text-gray-900">
              <span>TOTAL PRECUENTA:</span>
              <span>S/ {totalAmount.toFixed(2)}</span>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowPrebill(false)}
                className="w-1/2 py-2 border border-gray-300 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-100 cursor-pointer"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  window.print();
                  setShowPrebill(false);
                }}
                className="w-1/2 py-2 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-black cursor-pointer"
              >
                🖨️ Imprimir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DE PAGO / CHECKOUT --- */}
      <CheckoutModal
        table={{
          ...table,
          currentOrder: table.currentOrder
            ? { ...table.currentOrder, items: currentItems }
            : {
                id: '',
                table: table,
                status: 'PENDING',
                subtotal: totalAmount,
                discount: 0,
                total: totalAmount,
                items: currentItems,
                createdAt: new Date().toISOString(),
              },
        }}
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onConfirmPayment={handleConfirmPayment}
      />
    </>
  );
};