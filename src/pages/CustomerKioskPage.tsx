// src/pages/CustomerKioskPage.tsx
import React, { useState, useEffect } from 'react';
import { kioskService, type SelfOrderPayload } from '../services/kioskService';
import { useRestaurant } from '../context/RestaurantContext';
import type { Category, MenuItem } from '../types/menu';
import type { RestaurantTable } from '../types/restaurant';

interface CartItem {
  product: MenuItem;
  quantity: number;
}

export const CustomerKioskPage: React.FC = () => {
  const { settings } = useRestaurant();

  // Estados de datos
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Estados del flujo de compra
  const [orderType, setOrderType] = useState<'DINE_IN' | 'TAKEAWAY' | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);

  // Modales de Pago y Éxito
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<'TARJETA' | 'YAPE_PLIN' | 'EFECTIVO'>('TARJETA');
  const [orderSuccessTicket, setOrderSuccessTicket] = useState<{ id: string; number: number | string } | null>(null);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const [menuData, tablesData] = await Promise.all([
          kioskService.getPublicMenu(),
          kioskService.getPublicTables(),
        ]);
        setCategories(menuData.categories);
        setProducts(menuData.products);
        setTables(tablesData);
      } catch (err) {
        console.error('Error cargando menú del kiosko:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  // Manejadores de carrito
  const addToCart = (product: MenuItem) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.product.id === product.id);
      if (exists) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const next = item.quantity + delta;
            return next > 0 ? { ...item, quantity: next } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const totalCart = cart.reduce((acc, curr) => acc + curr.product.price * curr.quantity, 0);
  const totalItemsCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);

  // Procesar Pago y Enviar a Cocina
  const handleProcessPayment = async () => {
    if (cart.length === 0) return;

    try {
      setIsProcessingPayment(true);
      // Simulación de procesamiento de pasarela POS / QR (1.2s)
      await new Promise((res) => setTimeout(res, 1200));

      const payload: SelfOrderPayload = {
        orderType: orderType || 'TAKEAWAY',
        tableId: orderType === 'DINE_IN' ? selectedTableId : undefined,
        customerName: customerName.trim() || 'Cliente Autoservicio',
        paymentMethod,
        items: cart.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
      };

      const orderResult = await kioskService.submitSelfOrder(payload);

      setIsPaymentModalOpen(false);
      setCart([]);
      setOrderSuccessTicket({
        id: orderResult.id,
        number: orderResult.table?.tableNumber === 999 ? 'LLEVAR' : `#${orderResult.table?.tableNumber || '1'}`,
      });
    } catch (err) {
      console.error('Error al procesar pago del pedido:', err);
      alert('No se pudo procesar el pago. Por favor intenta de nuevo.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const resetAll = () => {
    setOrderType(null);
    setCart([]);
    setSelectedTableId('');
    setCustomerName('');
    setOrderSuccessTicket(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 font-bold text-base">
        Cargando experiencia de autoservicio...
      </div>
    );
  }

  // --- PANTALLA 1: BIENVENIDA Y ELECCIÓN (Para Comer Aquí vs Para Llevar) ---
  if (!orderType && !orderSuccessTicket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 via-rose-600 to-amber-500 flex flex-col justify-between p-6 sm:p-12 text-white select-none">
        <div className="text-center space-y-2 mt-8">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-white text-red-600 flex items-center justify-center font-black text-3xl shadow-xl">
            {settings.logoInitial}
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight">{settings.name}</h1>
          <p className="text-sm sm:text-base text-red-100 font-medium">{settings.slogan}</p>
        </div>

        <div className="max-w-3xl w-full mx-auto space-y-6">
          <h2 className="text-center text-xl sm:text-2xl font-black uppercase tracking-wide">
            ¿Cómo deseas disfrutar tu pedido hoy?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Opción Para Llevar (Sin Colas / QR) */}
            <button
              type="button"
              onClick={() => setOrderType('TAKEAWAY')}
              className="bg-white hover:bg-gray-50 text-gray-900 rounded-3xl p-8 shadow-2xl flex flex-col items-center justify-center gap-4 transition-transform active:scale-95 cursor-pointer border-4 border-transparent hover:border-amber-400"
            >
              <div className="w-24 h-24 rounded-full bg-amber-100 flex items-center justify-center text-5xl">
                🛍️
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-black uppercase text-gray-800">Para Llevar</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Pide directamente, paga al instante y recoge sin hacer cola en caja.
                </p>
              </div>
            </button>

            {/* Opción Comer Aquí (Mesa / Localizador) */}
            <button
              type="button"
              onClick={() => setOrderType('DINE_IN')}
              className="bg-white hover:bg-gray-50 text-gray-900 rounded-3xl p-8 shadow-2xl flex flex-col items-center justify-center gap-4 transition-transform active:scale-95 cursor-pointer border-4 border-transparent hover:border-red-400"
            >
              <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center text-5xl">
                🍽️
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-black uppercase text-gray-800">Comer en el Salón</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Elige tu mesa, ordena desde la pantalla y te lo llevamos listo.
                </p>
              </div>
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-red-200">
          ⚡ Sistema de Autoservicio Digital • Tu comanda se enviará a cocina tras confirmar el pago.
        </div>
      </div>
    );
  }

  // --- PANTALLA 2: TICKET DE ÉXITO POST-PAGO ---
  if (orderSuccessTicket) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 select-none">
        <div className="bg-white border border-gray-200 rounded-3xl p-8 sm:p-12 max-w-md w-full shadow-2xl text-center space-y-6 animate-in zoom-in-95">
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-4xl">
            ✓
          </div>

          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">
              ¡Pago Confirmado con Éxito!
            </span>
            <h2 className="text-3xl font-black text-gray-900 mt-1">Comanda en Cocina</h2>
            <p className="text-xs text-gray-500 mt-2">
              Nuestro equipo culinario ya está preparando tus platos.
            </p>
          </div>

          <div className="bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-300">
            <span className="text-xs font-bold text-gray-400 uppercase">Número de Retiro / Mesa</span>
            <p className="text-5xl font-black text-red-600 mt-2 tracking-tight">
              {orderSuccessTicket.number}
            </p>
          </div>

          <button
            type="button"
            onClick={resetAll}
            className="w-full py-4 bg-red-600 hover:bg-red-700 text-white text-sm font-black uppercase tracking-wider rounded-2xl shadow-md cursor-pointer transition-all active:scale-98"
          >
            Hacer Otro Pedido
          </button>
        </div>
      </div>
    );
  }

  // --- PANTALLA 3: CATÁLOGO DIGITAL Y CARRITO AUTOSERVICIO ---
  const filteredProducts = products.filter((p) => {
    const matchesCat =
      selectedCategory === 'ALL' ||
      p.categoryId === selectedCategory ||
      p.category?.id === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-between">
      {/* Barra Superior */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-600 text-white font-black text-base flex items-center justify-center shadow-xs">
            {settings.logoInitial}
          </div>
          <div>
            <h1 className="text-lg font-black text-gray-900 leading-tight">{settings.name}</h1>
            <span className="text-[11px] font-bold text-red-600 uppercase flex items-center gap-1">
              <span>{orderType === 'TAKEAWAY' ? '🛍️ Para Llevar' : '🍽️ Comer en Salón'}</span>
              {orderType === 'DINE_IN' && selectedTableId && (
                <span className="text-gray-600">
                  (Mesa #{tables.find((t) => t.id === selectedTableId)?.tableNumber})
                </span>
              )}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={resetAll}
          className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 cursor-pointer transition-colors"
        >
          ✕ Cambiar Modo
        </button>
      </header>

      {/* Contenedor Principal (Catálogo + Carrito) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 max-w-7xl w-full mx-auto p-4 sm:p-6 gap-6">
        {/* Catálogo de Platos (8 Columnas) */}
        <main className="lg:col-span-8 space-y-4">
          {/* Si es Comer en Salón y no ha elegido mesa */}
          {orderType === 'DINE_IN' && (
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-2">
              <label className="block text-xs font-bold text-gray-700 uppercase">
                🪑 Selecciona tu Mesa en el Salón:
              </label>
              <select
                value={selectedTableId}
                onChange={(e) => setSelectedTableId(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold outline-none focus:border-red-500"
              >
                <option value="">-- Elige el número de tu mesa --</option>
                {tables.map((tbl) => (
                  <option key={tbl.id} value={tbl.id}>
                    Mesa #{tbl.tableNumber} (Capacidad: {tbl.capacity} personas)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Buscador y Categorías */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3">
            <input
              type="text"
              placeholder="🔍 ¿Qué se te antoja hoy? (Hamburguesas, Bebidas, Postres...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-red-500"
            />

            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedCategory('ALL')}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                  selectedCategory === 'ALL'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Todas las Opciones
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                    selectedCategory === c.id
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Grilla de Platos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredProducts.map((p) => {
              const inCart = cart.find((i) => i.product.id === p.id);
              return (
                <div
                  key={p.id}
                  className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div className="space-y-2">
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-full h-32 object-cover rounded-xl border border-gray-100"
                      />
                    ) : (
                      <div className="w-full h-32 bg-gray-100 rounded-xl flex items-center justify-center text-3xl text-gray-300">
                        🍽️
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-bold text-gray-800 leading-tight">{p.name}</h4>
                      <p className="text-[11px] text-gray-400 line-clamp-2 mt-0.5">
                        {p.description || 'Deliciosa preparación artesanal.'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 mt-2 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-sm font-black text-red-600">
                      {settings.currency} {p.price.toFixed(2)}
                    </span>

                    {inCart ? (
                      <div className="flex items-center gap-1.5 bg-red-50 p-1 rounded-xl border border-red-200">
                        <button
                          type="button"
                          onClick={() => updateQuantity(p.id, -1)}
                          className="w-6 h-6 rounded-lg bg-white text-red-600 font-bold text-xs flex items-center justify-center shadow-xs cursor-pointer"
                        >
                          -
                        </button>
                        <span className="text-xs font-black text-red-700 w-4 text-center">
                          {inCart.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(p.id, 1)}
                          className="w-6 h-6 rounded-lg bg-red-600 text-white font-bold text-xs flex items-center justify-center shadow-xs cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => addToCart(p)}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-colors"
                      >
                        + Agregar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </main>

        {/* Barra Lateral de Mi Bandeja / Carrito (4 Columnas) */}
        <aside className="lg:col-span-4 bg-white border border-gray-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between h-fit sticky top-20 space-y-4">
          <div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider">
                🛒 Mi Bandeja ({totalItemsCount})
              </h3>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={() => setCart([])}
                  className="text-[11px] font-bold text-gray-400 hover:text-red-500 cursor-pointer"
                >
                  Vaciar
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs italic">
                Aún no has agregado platos a tu bandeja.
              </div>
            ) : (
              <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto space-y-2 py-2">
                {cart.map((item) => (
                  <div key={item.product.id} className="pt-2 first:pt-0 flex justify-between items-center text-xs">
                    <div className="flex-1 pr-2">
                      <p className="font-bold text-gray-800">{item.product.name}</p>
                      <p className="text-[11px] text-gray-400 font-semibold">
                        {settings.currency} {item.product.price.toFixed(2)} c/u
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-black text-gray-800">
                        {settings.currency} {(item.product.price * item.quantity).toFixed(2)}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="w-5 h-5 rounded bg-gray-100 font-bold text-xs flex items-center justify-center cursor-pointer"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold w-3 text-center">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="w-5 h-5 rounded bg-gray-100 font-bold text-xs flex items-center justify-center cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-bold text-gray-500 uppercase">Total a Pagar:</span>
              <span className="text-2xl font-black text-gray-900">
                {settings.currency} {totalCart.toFixed(2)}
              </span>
            </div>

            <button
              type="button"
              disabled={cart.length === 0 || (orderType === 'DINE_IN' && !selectedTableId)}
              onClick={() => setIsPaymentModalOpen(true)}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <span>💳</span>
              <span>Pagar y Enviar a Cocina</span>
            </button>

            {orderType === 'DINE_IN' && !selectedTableId && cart.length > 0 && (
              <p className="text-[11px] text-red-500 text-center font-bold">
                ⚠️ Por favor selecciona tu número de mesa arriba para continuar.
              </p>
            )}
          </div>
        </aside>
      </div>

      {/* --- MODAL DE PASARELA DE PAGO AUTOSERVICIO --- */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-gray-900 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 border border-gray-200">
            <div className="text-center border-b pb-3">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
                Pasarela de Pago Segura
              </span>
              <h3 className="text-xl font-black text-gray-800 mt-0.5">Confirmación de Pago</h3>
              <p className="text-xs text-gray-500">
                Elige tu medio de pago para procesar la comanda directamente a cocina.
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 flex justify-between items-center">
              <span className="text-xs font-bold text-gray-500 uppercase">Monto Total:</span>
              <span className="text-2xl font-black text-emerald-600">
                {settings.currency} {totalCart.toFixed(2)}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                Nombre del Cliente (Para llamarte cuando esté listo):
              </label>
              <input
                type="text"
                placeholder="Ej. Juan Pérez"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold outline-none focus:border-red-500"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-600 uppercase">Medio de Pago</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('TARJETA')}
                  className={`py-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 cursor-pointer transition-all ${
                    paymentMethod === 'TARJETA'
                      ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-xs'
                      : 'bg-white border-gray-200 text-gray-600'
                  }`}
                >
                  <span className="text-xl">💳</span>
                  <span>Tarjeta/POS</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('YAPE_PLIN')}
                  className={`py-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 cursor-pointer transition-all ${
                    paymentMethod === 'YAPE_PLIN'
                      ? 'bg-purple-50 border-purple-500 text-purple-700 shadow-xs'
                      : 'bg-white border-gray-200 text-gray-600'
                  }`}
                >
                  <span className="text-xl">📱</span>
                  <span>QR / Yape</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('EFECTIVO')}
                  className={`py-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 cursor-pointer transition-all ${
                    paymentMethod === 'EFECTIVO'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-xs'
                      : 'bg-white border-gray-200 text-gray-600'
                  }`}
                >
                  <span className="text-xl">💵</span>
                  <span>Efectivo</span>
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t">
              <button
                type="button"
                disabled={isProcessingPayment}
                onClick={() => setIsPaymentModalOpen(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isProcessingPayment}
                onClick={handleProcessPayment}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer shadow-sm"
              >
                {isProcessingPayment ? 'Procesando Pago...' : '✓ Confirmar Pago'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerKioskPage;