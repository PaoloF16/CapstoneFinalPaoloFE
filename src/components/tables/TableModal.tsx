import React, { useState, useEffect } from 'react';
import type { RestaurantTable as Table, OrderItem, Order } from '../../types/restaurant';
import { CheckoutModal } from './CheckoutModal';
import { useRestaurant } from '../../context/RestaurantContext'; // 👈 1. Importamos el contexto

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  isGlutenFree?: boolean;
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
  onSendToKitchen: (tableId: string, items: { productId: string; quantity: number }[]) => Promise<void>;
  onCloseTable: (tableId: string) => void;
}

export const TableModal: React.FC<TableModalProps> = ({
  table,
  isOpen,
  onClose,
  menuItems,
  categories,
  onOpenTable,
  onSendToKitchen,
  onCloseTable,
}) => {
  // 👈 2. Obtenemos la configuración personalizada del restaurante
  const { settings } = useRestaurant();

  if (!isOpen || !table) return null;

  // Estados locales
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [newItems, setNewItems] = useState<OrderItem[]>([]); // Platos nuevos seleccionados
  const [sendingKitchen, setSendingKitchen] = useState<boolean>(false);

  // Modales
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [showPrebill, setShowPrebill] = useState<boolean>(false);

  useEffect(() => {
    setNewItems([]);
    setSelectedCategory('Todas');
    setSearchQuery('');
  }, [table?.id, isOpen]);

  const existingItems = table.currentOrder?.items || [];

  // Filtrado de platos
  const filteredMenuItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === 'Todas' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Agregar plato a la nueva ronda
  const handleAddNewItem = (item: MenuItem) => {
    setNewItems((prev) => {
      const existing = prev.find((i) => i.product.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          product: {
            id: item.id,
            name: item.name,
            price: item.price,
            isGlutenFree: item.isGlutenFree,
          },
          quantity: 1,
          unitPrice: item.price,
        },
      ];
    });
  };

  // Modificar cantidad de platos nuevos
  const handleUpdateNewQuantity = (productId: string, delta: number) => {
    setNewItems((prev) =>
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

  // Enviar platos a la cocina
  const handleSendToKitchenSubmit = async () => {
    if (newItems.length === 0) return;

    try {
      setSendingKitchen(true);
      const payload = newItems.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));

      await onSendToKitchen(table.id, payload);
      setNewItems([]);
    } catch (error) {
      console.error('Error al enviar a cocina:', error);
      alert('Error al enviar platos a cocina.');
    } finally {
      setSendingKitchen(false);
    }
  };

  const handleConfirmPayment = (tableId: string) => {
    onCloseTable(tableId);
    onClose();
  };

  // Cálculos de montos
  const existingSubtotal = existingItems.reduce(
    (acc, item) => acc + (item.product?.price || item.unitPrice || 0) * item.quantity,
    0
  );
  const newSubtotal = newItems.reduce(
    (acc, item) => acc + (item.product?.price || item.unitPrice || 0) * item.quantity,
    0
  );
  const totalAmount = existingSubtotal + newSubtotal;
  const totalAllItems = [...existingItems, ...newItems];

  return (
    <>
      <div className="fixed inset-0 z-40 flex justify-end bg-black/40 backdrop-blur-xs">
        <div className="w-full max-w-4xl bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black text-gray-800">Mesa #{table.tableNumber}</h2>
                <span
                  className={`px-3 py-0.5 text-xs font-black uppercase rounded-full ${
                    table.status === 'AVAILABLE'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {table.status === 'AVAILABLE' ? 'Libre' : 'Ocupada'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Capacidad: <strong className="text-gray-700">{table.capacity} personas</strong>
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 text-2xl font-bold rounded-lg cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Cuerpo */}
          <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
            
            {/* Columna Izquierda: Comandas y Totales */}
            <div className="w-full md:w-1/2 p-5 border-r border-gray-200 overflow-y-auto flex flex-col justify-between bg-gray-50/30">
              <div className="space-y-4">
                
                {/* 1. Nuevos platos por enviar */}
                <div className="bg-white p-4 rounded-2xl border-2 border-red-200 shadow-xs space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-extrabold text-sm text-red-600 uppercase tracking-wider flex items-center gap-1.5">
                      <span>🔥</span> Nuevos Platos a Enviar
                    </h3>
                    {newItems.length > 0 && (
                      <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                        {newItems.reduce((acc, i) => acc + i.quantity, 0)} platos
                      </span>
                    )}
                  </div>

                  {newItems.length === 0 ? (
                    <p className="text-xs text-gray-400 italic py-3 text-center">
                      Selecciona platos del menú a la derecha para agregarlos a la comanda.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {newItems.map((item) => (
                        <div
                          key={item.product.id}
                          className="flex items-center justify-between p-2.5 bg-red-50/50 rounded-xl border border-red-100"
                        >
                          <div className="flex-1 pr-2">
                            <p className="text-xs font-bold text-gray-800">{item.product.name}</p>
                            <p className="text-[11px] text-gray-500">
                              {settings.currency} {(item.product.price || item.unitPrice || 0).toFixed(2)} c/u
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleUpdateNewQuantity(item.product.id, -1)}
                              className="w-7 h-7 bg-white border border-red-200 text-red-600 rounded-lg flex items-center justify-center font-black hover:bg-red-50 cursor-pointer"
                            >
                              -
                            </button>
                            <span className="text-xs font-black w-4 text-center text-gray-800">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleUpdateNewQuantity(item.product.id, 1)}
                              className="w-7 h-7 bg-white border border-red-200 text-red-600 rounded-lg flex items-center justify-center font-black hover:bg-red-50 cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={handleSendToKitchenSubmit}
                        disabled={sendingKitchen}
                        className="w-full py-3 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-black text-xs rounded-xl shadow-md shadow-red-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2 uppercase tracking-wide"
                      >
                        <span>👨‍🍳</span>
                        <span>{sendingKitchen ? 'Enviando comanda...' : 'Enviar a Cocina'}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. Consumo confirmado */}
                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-2">
                  <h3 className="font-bold text-xs text-gray-700 uppercase tracking-wider">
                    📋 Consumo Confirmado en Mesa
                  </h3>

                  {existingItems.length === 0 ? (
                    <p className="text-xs text-gray-400 italic py-2 text-center">
                      No hay consumos previos registrados en esta mesa.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto divide-y divide-gray-100">
                      {existingItems.map((item, idx) => (
                        <div key={item.id || idx} className="pt-2 first:pt-0 flex justify-between items-center text-xs">
                          <span className="text-gray-700">
                            <strong className="font-black text-gray-900">{item.quantity}x</strong> {item.product.name}
                          </span>
                          <span className="font-semibold text-gray-800">
                            {settings.currency} {((item.product?.price || item.unitPrice || 0) * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Totales y Acciones */}
              <div className="pt-4 border-t border-gray-200 mt-4 space-y-3 bg-white p-4 rounded-2xl border border-gray-100">
                <div className="flex justify-between items-center text-lg font-black text-gray-900">
                  <span>Total Cuenta:</span>
                  <span className="text-red-600 text-xl font-black">
                    {settings.currency} {totalAmount.toFixed(2)}
                  </span>
                </div>

                {existingItems.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowPrebill(true)}
                      className="bg-gray-800 hover:bg-black text-white font-bold py-2.5 rounded-xl shadow-sm transition-colors text-xs flex items-center justify-center gap-1 cursor-pointer"
                    >
                      📄 Precuenta
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCheckoutOpen(true)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl shadow-sm transition-colors text-xs flex items-center justify-center gap-1 cursor-pointer"
                    >
                      💳 Cobrar Cuenta
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Columna Derecha: Catálogo de Platos */}
            <div className="w-full md:w-1/2 p-5 flex flex-col bg-white overflow-y-auto">
              <h3 className="font-bold text-gray-800 mb-3 text-base">Carta del Restaurante</h3>
              
              <input
                type="text"
                placeholder="🔍 Buscar plato o bebida..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs mb-3 focus:outline-none focus:ring-2 focus:ring-red-500"
              />

              <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none">
                {['Todas', ...categories].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap font-bold transition-colors cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="space-y-2 flex-1 overflow-y-auto pr-1">
                {filteredMenuItems.map((menuItem) => (
                  <div
                    key={menuItem.id}
                    onClick={() => handleAddNewItem(menuItem)}
                    className="p-3 bg-white border border-gray-200 hover:border-red-400 hover:shadow-sm rounded-xl flex justify-between items-center cursor-pointer transition-all active:scale-[0.99]"
                  >
                    <div>
                      <p className="text-sm font-bold text-gray-800">{menuItem.name}</p>
                      <p className="text-xs font-extrabold text-red-600 mt-0.5">
                        {settings.currency} {menuItem.price.toFixed(2)}
                      </p>
                    </div>
                    <button className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-black text-lg flex items-center justify-center">
                      +
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-100 cursor-pointer"
            >
              Cerrar Panel
            </button>
          </div>

        </div>
      </div>

      {/* 👈 3. MODAL BORRADOR PRECUENTA (100% DINÁMICO) */}
      {showPrebill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs p-6 border border-gray-100 space-y-4">
            
            {/* Cabecera del Ticket con los datos de settings */}
            <div className="text-center border-b pb-3 space-y-0.5">
              <h4 className="font-black text-base text-gray-900 uppercase tracking-wide">
                {settings.name}
              </h4>
              {settings.slogan && (
                <p className="text-[10px] text-gray-500 italic">{settings.slogan}</p>
              )}
              {settings.taxId && (
                <p className="text-[10px] text-gray-600">RUC/NIF: {settings.taxId}</p>
              )}
              {settings.address && (
                <p className="text-[10px] text-gray-600">{settings.address}</p>
              )}
              {settings.phone && (
                <p className="text-[10px] text-gray-600">Tel: {settings.phone}</p>
              )}
              <p className="text-[9px] text-red-600 font-bold uppercase mt-1">
                {settings.ticketHeader}
              </p>
              <p className="text-xs font-bold text-gray-700 mt-1">Mesa #{table.tableNumber}</p>
            </div>
            
            {/* Lista de Consumos */}
            <div className="space-y-1.5 text-xs max-h-48 overflow-y-auto font-mono">
              {totalAllItems.map((item, idx) => (
                <div key={item.id || idx} className="flex justify-between">
                  <span>{item.quantity}x {item.product.name}</span>
                  <span className="font-semibold">
                    {settings.currency} {((item.product?.price || item.unitPrice || 0) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="border-t pt-2 flex justify-between font-black text-sm text-gray-900 font-mono">
              <span>TOTAL PRECUENTA:</span>
              <span className="text-red-600">
                {settings.currency} {totalAmount.toFixed(2)}
              </span>
            </div>

            {/* Mensaje de Pie */}
            {settings.ticketFooter && (
              <p className="text-[10px] text-gray-500 text-center italic border-t pt-2">
                {settings.ticketFooter}
              </p>
            )}

            {/* Botones */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowPrebill(false)}
                className="w-1/2 py-2 border border-gray-300 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-100 cursor-pointer"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  window.print();
                  setShowPrebill(false);
                }}
                className="w-1/2 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black cursor-pointer"
              >
                🖨️ Imprimir
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Modal de Pago / Checkout */}
      <CheckoutModal
        table={{
          ...table,
          currentOrder: table.currentOrder
            ? { ...table.currentOrder, items: totalAllItems }
            : {
                id: '',
                table: table,
                status: 'PENDING',
                subtotal: totalAmount,
                discount: 0,
                total: totalAmount,
                items: totalAllItems,
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