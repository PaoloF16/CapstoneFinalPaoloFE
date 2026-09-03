// src/pages/CustomerKioskPage.tsx
import React, { useState, useEffect } from 'react';
import { kioskService, type SelfOrderPayload } from '../services/kioskService';
import { useRestaurant } from '../context/RestaurantContext';
import { useLanguage } from '../context/LanguageContext';
import {
  TakeawayIcon,
  DineInIcon,
  CardIcon,
  QrPayIcon,
  CashIcon,
} from '../components/common/Icons';
import type { Category, MenuItem } from '../types/menu';
import type { RestaurantTable } from '../types/restaurant';

interface CartItem {
  product: MenuItem;
  quantity: number;
}

export const CustomerKioskPage: React.FC = () => {
  const { settings } = useRestaurant();
  const { t, language, setLanguage } = useLanguage();

  const currentLang = String(language).toUpperCase();

  const languages = [
    { code: 'ES', label: 'ES', flag: '🇪🇸' },
    { code: 'EN', label: 'EN', flag: '🇬🇧' },
    { code: 'IT', label: 'IT', flag: '🇮🇹' },
  ];

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
        number: orderResult.table?.tableNumber === 999 
          ? t('kiosk.takeawayBadge', 'LLEVAR') 
          : `#${orderResult.table?.tableNumber || '1'}`,
      });
    } catch (err) {
      console.error('Error al procesar pago del pedido:', err);
      alert('Error al procesar el pago.');
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
      <div className="min-h-screen flex items-center justify-center bg-[#0d0f14] text-orange-400 font-bold text-base select-none">
        {t('kiosk.loading', 'Cargando experiencia de autoservicio...')}
      </div>
    );
  }

  // --- PANTALLA 1: BIENVENIDA (FONDO NEGRO/NARANJA + TARJETAS BLANCAS) ---
  if (!orderType && !orderSuccessTicket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0b0e] via-[#111319] to-[#251307] flex flex-col justify-between p-6 sm:p-12 text-white select-none relative overflow-hidden">
        
        {/* Destellos ambientales de luz naranja */}
        <div className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-orange-600/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[-120px] right-[-80px] w-[500px] h-[400px] bg-amber-600/10 rounded-full blur-[150px] pointer-events-none" />

        {/* Barra superior con selector de idioma */}
        <div className="flex justify-between items-center max-w-5xl w-full mx-auto relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-orange-500/25 border border-orange-400/30">
              {settings.logoInitial}
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">{settings.name}</h2>
              <p className="text-xs text-orange-400/90 font-medium">{settings.slogan}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-[#161922]/90 backdrop-blur-md p-1.5 rounded-2xl border border-gray-800 shadow-xl">
            {languages.map(({ code, label, flag }) => (
              <button
                key={code}
                type="button"
                onClick={() => setLanguage(code)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  currentLang === code
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/30 scale-105'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{flag}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Zona Central: Título y Tarjetas BLANCAS */}
        <div className="max-w-4xl w-full mx-auto space-y-8 my-auto py-8 relative z-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white drop-shadow-sm">
              {t('kiosk.selectMode', '¿Cómo deseas disfrutar tu pedido hoy?')}
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full mx-auto" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 pt-4">
            {/* Tarjeta 1: Para Llevar (BLANCA) */}
            <button
              type="button"
              onClick={() => setOrderType('TAKEAWAY')}
              className="group bg-white hover:bg-gray-50 text-gray-900 rounded-3xl p-8 sm:p-10 shadow-2xl flex flex-col items-center justify-center gap-5 transition-all duration-300 active:scale-95 cursor-pointer border-4 border-transparent hover:border-orange-500 hover:shadow-orange-500/20"
            >
              <div className="w-24 h-24 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-500 group-hover:scale-105 transition-transform duration-300">
                <TakeawayIcon className="w-12 h-12 text-orange-500" />
              </div>
              <div className="text-center space-y-1.5">
                <h3 className="text-2xl font-black uppercase tracking-wide text-gray-900 group-hover:text-orange-600 transition-colors">
                  {t('kiosk.takeaway', 'Para Llevar')}
                </h3>
                <p className="text-xs text-gray-500 max-w-[260px] mx-auto leading-relaxed font-medium">
                  {t('kiosk.takeawayDesc', 'Pide directamente, paga al instante y recoge sin hacer cola en caja.')}
                </p>
              </div>
            </button>

            {/* Tarjeta 2: Comer en el Salón (BLANCA) */}
            <button
              type="button"
              onClick={() => setOrderType('DINE_IN')}
              className="group bg-white hover:bg-gray-50 text-gray-900 rounded-3xl p-8 sm:p-10 shadow-2xl flex flex-col items-center justify-center gap-5 transition-all duration-300 active:scale-95 cursor-pointer border-4 border-transparent hover:border-orange-500 hover:shadow-orange-500/20"
            >
              <div className="w-24 h-24 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 group-hover:scale-105 transition-transform duration-300">
                <DineInIcon className="w-12 h-12 text-amber-600" />
              </div>
              <div className="text-center space-y-1.5">
                <h3 className="text-2xl font-black uppercase tracking-wide text-gray-900 group-hover:text-orange-600 transition-colors">
                  {t('kiosk.dineIn', 'Comer en el Salón')}
                </h3>
                <p className="text-xs text-gray-500 max-w-[260px] mx-auto leading-relaxed font-medium">
                  {t('kiosk.dineInDesc', 'Elige tu mesa, ordena desde la pantalla y te lo llevamos listo.')}
                </p>
              </div>
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-gray-400 font-medium tracking-wide relative z-10">
          {t('kiosk.systemNotice', '⚡ Sistema de Autoservicio Digital • Tu comanda se enviará a cocina tras confirmar el pago.')}
        </div>
      </div>
    );
  }

  // --- PANTALLA 2: TICKET DE ÉXITO (MODAL BLANCO) ---
  if (orderSuccessTicket) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0b0e] via-[#111319] to-[#251307] flex items-center justify-center p-6 select-none relative overflow-hidden">
        <div className="bg-white text-gray-900 rounded-3xl p-8 sm:p-12 max-w-md w-full shadow-2xl text-center space-y-6 relative z-10 border border-gray-100">
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-4xl font-bold shadow-inner">
            ✓
          </div>

          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">
              {t('kiosk.successBadge', '¡Pago Confirmado con Éxito!')}
            </span>
            <h2 className="text-3xl font-black text-gray-900 mt-1">
              {t('kiosk.inKitchen', 'Comanda en Cocina')}
            </h2>
            <p className="text-xs text-gray-500 mt-2">
              {t('kiosk.kitchenPrepDesc', 'Nuestro equipo culinario ya está preparando tus platos.')}
            </p>
          </div>

          <div className="bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-300">
            <span className="text-xs font-bold text-gray-400 uppercase">
              {t('kiosk.pickupNumberLabel', 'Número de Retiro / Mesa')}
            </span>
            <p className="text-5xl font-black text-orange-600 mt-2 tracking-tight">
              {orderSuccessTicket.number}
            </p>
          </div>

          <button
            type="button"
            onClick={resetAll}
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-sm font-black uppercase tracking-wider rounded-2xl shadow-lg shadow-orange-500/25 cursor-pointer transition-all active:scale-98"
          >
            {t('kiosk.orderAnother', 'Hacer Otro Pedido')}
          </button>
        </div>
      </div>
    );
  }

  // --- PANTALLA 3: CATÁLOGO DIGITAL Y CARRITO (FONDO OSCURO + CARDS BLANCAS) ---
  const filteredProducts = products.filter((p) => {
    const matchesCat =
      selectedCategory === 'ALL' ||
      p.categoryId === selectedCategory ||
      p.category?.id === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#0d0f14] text-gray-100 flex flex-col justify-between select-none">
      {/* Barra Superior */}
      <header className="bg-[#141720] border-b border-gray-800 px-6 py-4 flex justify-between items-center sticky top-0 z-30 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white font-black text-base flex items-center justify-center shadow-md shadow-orange-500/20">
            {settings.logoInitial}
          </div>
          <div>
            <h1 className="text-lg font-black text-white leading-tight">{settings.name}</h1>
            <span className="text-[11px] font-bold text-orange-400 uppercase flex items-center gap-1">
              <span>{orderType === 'TAKEAWAY' ? `🛍️ ${t('kiosk.takeaway', 'Para Llevar')}` : `🍽️ ${t('kiosk.dineIn', 'Comer en Salón')}`}</span>
              {orderType === 'DINE_IN' && selectedTableId && (
                <span className="text-gray-400">
                  ({t('kitchen.table', 'Mesa')} #{tables.find((t) => t.id === selectedTableId)?.tableNumber})
                </span>
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Selector de idioma */}
          <div className="flex items-center gap-1 bg-[#0e1017] p-1 rounded-xl border border-gray-800">
            {languages.map(({ code, label, flag }) => (
              <button
                key={code}
                type="button"
                onClick={() => setLanguage(code)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1 ${
                  currentLang === code
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span>{flag}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={resetAll}
            className="px-3.5 py-2 rounded-xl bg-[#1d202b] hover:bg-gray-800 border border-gray-700 text-xs font-bold text-gray-300 cursor-pointer transition-colors"
          >
            {t('kiosk.changeMode', '✕ Cambiar Modo')}
          </button>
        </div>
      </header>

      {/* Contenedor Principal (Catálogo + Carrito) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 max-w-7xl w-full mx-auto p-4 sm:p-6 gap-6">
        {/* Catálogo de Platos (8 Columnas) */}
        <main className="lg:col-span-8 space-y-4">
          {orderType === 'DINE_IN' && (
            <div className="bg-white text-gray-900 p-4 rounded-3xl border border-gray-200 shadow-sm space-y-2">
              <label className="block text-xs font-bold text-gray-700 uppercase">
                {t('kiosk.selectTable', '🪑 Selecciona tu Mesa en el Salón:')}
              </label>
              <select
                value={selectedTableId}
                onChange={(e) => setSelectedTableId(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-xl text-xs font-bold outline-none focus:border-orange-500"
              >
                <option value="">{t('kiosk.chooseTableOption', '-- Elige el número de tu mesa --')}</option>
                {tables.map((tbl) => (
                  <option key={tbl.id} value={tbl.id}>
                    {t('kitchen.table', 'Mesa')} #{tbl.tableNumber} ({t('kiosk.capacityLabel', 'Capacidad')}: {tbl.capacity} {t('kiosk.peopleLabel', 'personas')})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Buscador y Categorías (BLANCO) */}
          <div className="bg-white text-gray-900 p-4 rounded-3xl border border-gray-200 shadow-sm space-y-3">
            <input
              type="text"
              placeholder={t('kiosk.searchPlaceholder', '🔍 ¿Qué se te antoja hoy?')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 font-semibold outline-none focus:border-orange-500"
            />

            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedCategory('ALL')}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                  selectedCategory === 'ALL'
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t('kiosk.allOptions', 'Todas las Opciones')}
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                    selectedCategory === c.id
                      ? 'bg-orange-500 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Grilla de Platos (TARJETAS BLANCAS) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredProducts.map((p) => {
              const inCart = cart.find((i) => i.product.id === p.id);
              return (
                <div
                  key={p.id}
                  className="bg-white text-gray-900 border border-gray-200 rounded-3xl p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
                >
                  <div className="space-y-2">
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-full h-32 object-cover rounded-2xl border border-gray-100"
                      />
                    ) : (
                      <div className="w-full h-32 bg-gray-100 rounded-2xl flex items-center justify-center text-3xl text-gray-400">
                        🍽️
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 leading-tight">{p.name}</h4>
                      <p className="text-[11px] text-gray-400 line-clamp-2 mt-0.5">
                        {p.description || 'Deliciosa preparación artesanal.'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 mt-2 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-sm font-black text-orange-600">
                      {settings.currency} {p.price.toFixed(2)}
                    </span>

                    {inCart ? (
                      <div className="flex items-center gap-1.5 bg-orange-50 p-1 rounded-xl border border-orange-200">
                        <button
                          type="button"
                          onClick={() => updateQuantity(p.id, -1)}
                          className="w-6 h-6 rounded-lg bg-white text-orange-600 font-bold text-xs flex items-center justify-center shadow-xs cursor-pointer hover:bg-gray-50"
                        >
                          -
                        </button>
                        <span className="text-xs font-black text-orange-600 w-4 text-center">
                          {inCart.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(p.id, 1)}
                          className="w-6 h-6 rounded-lg bg-orange-500 text-white font-bold text-xs flex items-center justify-center shadow-xs cursor-pointer hover:bg-orange-600"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => addToCart(p)}
                        className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-colors"
                      >
                        {t('kiosk.add', '+ Agregar')}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </main>

        {/* Barra Lateral de Mi Bandeja / Carrito (BLANCA) */}
        <aside className="lg:col-span-4 bg-white text-gray-900 border border-gray-200 rounded-3xl p-5 shadow-xl flex flex-col justify-between h-fit sticky top-20 space-y-4">
          <div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider">
                🛒 {t('kiosk.myTray', 'Mi Bandeja')} ({totalItemsCount})
              </h3>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={() => setCart([])}
                  className="text-[11px] font-bold text-gray-400 hover:text-orange-600 cursor-pointer"
                >
                  {t('kiosk.clear', 'Vaciar')}
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs italic">
                {t('kiosk.emptyTray', 'Aún no has agregado platos a tu bandeja.')}
              </div>
            ) : (
              <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto space-y-2 py-2">
                {cart.map((item) => (
                  <div key={item.product.id} className="pt-2 first:pt-0 flex justify-between items-center text-xs">
                    <div className="flex-1 pr-2">
                      <p className="font-bold text-gray-800">{item.product.name}</p>
                      <p className="text-[11px] text-gray-400 font-semibold">
                        {settings.currency} {item.product.price.toFixed(2)} {t('kiosk.unitPrice', 'c/u')}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-black text-gray-900">
                        {settings.currency} {(item.product.price * item.quantity).toFixed(2)}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="w-5 h-5 rounded bg-gray-100 text-gray-700 font-bold text-xs flex items-center justify-center cursor-pointer hover:bg-gray-200"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold text-gray-800 w-3 text-center">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="w-5 h-5 rounded bg-gray-100 text-gray-700 font-bold text-xs flex items-center justify-center cursor-pointer hover:bg-gray-200"
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
              <span className="text-xs font-bold text-gray-500 uppercase">
                {t('kiosk.totalPay', 'Total a Pagar:')}
              </span>
              <span className="text-2xl font-black text-gray-900">
                {settings.currency} {totalCart.toFixed(2)}
              </span>
            </div>

            <button
              type="button"
              disabled={cart.length === 0 || (orderType === 'DINE_IN' && !selectedTableId)}
              onClick={() => setIsPaymentModalOpen(true)}
              className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-40 text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-lg shadow-orange-500/20 cursor-pointer transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <CardIcon className="w-4 h-4 text-white" />
              <span>{t('kiosk.payAndSend', 'Pagar y Enviar a Cocina')}</span>
            </button>

            {orderType === 'DINE_IN' && !selectedTableId && cart.length > 0 && (
              <p className="text-[11px] text-red-500 text-center font-bold">
                {t('kiosk.selectMesaAlert', '⚠️ Por favor selecciona tu número de mesa arriba para continuar.')}
              </p>
            )}
          </div>
        </aside>
      </div>

      {/* --- MODAL DE PASARELA DE PAGO (BLANCO) --- */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-gray-900 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 border border-gray-200">
            <div className="text-center border-b border-gray-100 pb-3">
              <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider block">
                {t('kiosk.gatewayBadge', 'Pasarela de Pago Segura')}
              </span>
              <h3 className="text-xl font-black text-gray-900 mt-0.5">
                {t('kiosk.gatewayTitle', 'Confirmación de Pago')}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {t('kiosk.gatewaySubtitle', 'Elige tu medio de pago para procesar la comanda directamente a cocina.')}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 flex justify-between items-center">
              <span className="text-xs font-bold text-gray-500 uppercase">
                {t('kiosk.amountTotal', 'Monto Total:')}
              </span>
              <span className="text-2xl font-black text-orange-600">
                {settings.currency} {totalCart.toFixed(2)}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                {t('kiosk.customerNameLabel', 'Nombre del Cliente (Para llamarte cuando esté listo):')}
              </label>
              <input
                type="text"
                placeholder={t('kiosk.customerNamePlaceholder', 'Ej. Juan Pérez')}
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full p-2.5 bg-white border border-gray-300 text-gray-900 rounded-xl text-xs font-bold outline-none focus:border-orange-500"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700 uppercase">
                {t('kiosk.paymentMethodLabel', 'Medio de Pago')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('TARJETA')}
                  className={`py-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                    paymentMethod === 'TARJETA'
                      ? 'bg-orange-50 border-orange-500 text-orange-600 shadow-xs'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <CardIcon className="w-5 h-5 text-orange-500" />
                  <span>{t('kiosk.cardPos', 'Tarjeta / POS')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('YAPE_PLIN')}
                  className={`py-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                    paymentMethod === 'YAPE_PLIN'
                      ? 'bg-orange-50 border-orange-500 text-orange-600 shadow-xs'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <QrPayIcon className="w-5 h-5 text-orange-500" />
                  <span>{t('kiosk.qrYape', 'QR / Digital Pay')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('EFECTIVO')}
                  className={`py-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                    paymentMethod === 'EFECTIVO'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-xs'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <CashIcon className="w-5 h-5 text-emerald-600" />
                  <span>{t('kiosk.cash', 'Efectivo')}</span>
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                disabled={isProcessingPayment}
                onClick={() => setIsPaymentModalOpen(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                {t('common.cancel', 'Cancelar')}
              </button>
              <button
                type="button"
                disabled={isProcessingPayment}
                onClick={handleProcessPayment}
                className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer shadow-md shadow-orange-500/20"
              >
                {isProcessingPayment ? t('kiosk.processingPayment', 'Procesando Pago...') : t('kiosk.confirmPaymentBtn', '✓ Confirmar Pago')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerKioskPage;