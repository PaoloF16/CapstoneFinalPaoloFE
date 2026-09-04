import React, { useState, useEffect } from 'react';
import {
  getTables,
  createTable,
  updateTable,
  deleteTable,
  createOrder,
  getActiveOrdersByTable,
  checkoutTable,
} from '../services/restaurantService';
import { menuService } from '../services/menuService';
import { useRestaurant } from '../context/RestaurantContext';
import { useLanguage } from '../context/LanguageContext';
import {
  ChairIcon,
  PencilIcon,
  DeleteIcon,
  CardIcon,
  CashIcon,
  PrintIcon,
} from '../components/common/Icons';
import type { RestaurantTable, Order } from '../types/restaurant';
import type { MenuItem, Category } from '../types/menu';

interface CartItem {
  product: MenuItem;
  quantity: number;
}

export const TablesDashboard: React.FC = () => {
  const { t } = useLanguage();
  const { settings } = useRestaurant();

  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);
  const [confirmedOrders, setConfirmedOrders] = useState<Order[]>([]);
  const [stagingCart, setStagingCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [productSearch, setProductSearch] = useState<string>('');
  const [sendingToKitchen, setSendingToKitchen] = useState<boolean>(false);

  // Modales
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<RestaurantTable | null>(null);
  const [tableForm, setTableForm] = useState({ tableNumber: 1, capacity: 4 });

  const [isPrecuentaModalOpen, setIsPrecuentaModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'EFECTIVO' | 'TARJETA'>('EFECTIVO');
  const [cashReceived, setCashReceived] = useState<string>('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [tablesData, catsData, prodsData] = await Promise.all([
        getTables(),
        menuService.getCategories(),
        menuService.getProducts(),
      ]);
      setTables(tablesData);
      setCategories(catsData);
      setProducts(prodsData.filter((p) => p.isAvailable));
    } catch (err) {
      console.error('Error cargando salón:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenTableOrder = async (table: RestaurantTable) => {
    setSelectedTable(table);
    setStagingCart([]);
    try {
      const orders = await getActiveOrdersByTable(table.id);
      setConfirmedOrders(orders);
    } catch {
      setConfirmedOrders([]);
    }
  };

  const handleAddToStaging = (product: MenuItem) => {
    setStagingCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateStagingQuantity = (productId: string, delta: number) => {
    setStagingCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleSendToKitchen = async () => {
    if (!selectedTable || stagingCart.length === 0) return;

    try {
      setSendingToKitchen(true);
      const itemsPayload = stagingCart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));

      await createOrder({
        tableId: selectedTable.id,
        items: itemsPayload,
      });

      const updatedOrders = await getActiveOrdersByTable(selectedTable.id);
      setConfirmedOrders(updatedOrders);
      setStagingCart([]);
      await loadData();
    } catch (err) {
      console.error('Error al enviar comanda:', err);
      alert('Error al enviar los platos a cocina.');
    } finally {
      setSendingToKitchen(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedTable) return;
    try {
      await checkoutTable(selectedTable, paymentMethod);
      setIsPaymentModalOpen(false);
      setSelectedTable(null);
      setStagingCart([]);
      setConfirmedOrders([]);
      await loadData();
    } catch (err: any) {
      console.error('Error al cobrar:', err.response?.data || err);
      alert('Error al procesar el pago: ' + (err.response?.data?.message || 'Verifica la consola'));
    }
  };

  const confirmedItems = confirmedOrders.flatMap((o: any) => {
    const list = o.items || o.orderItems || o.details || [];
    return list.map((item: any) => ({
      id: item.id || Math.random().toString(),
      name: item.product?.name || item.menuItem?.name || item.name || item.productName || 'Plato',
      quantity: Number(item.quantity || 1),
      price: Number(item.product?.price || item.menuItem?.price || item.price || item.unitPrice || 0),
    }));
  });

  const totalConfirmed = confirmedItems.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
  const totalStaging = stagingCart.reduce((acc, curr) => acc + curr.product.price * curr.quantity, 0);
  const totalGeneral = totalConfirmed + totalStaging;

  const filteredProducts = products.filter((p) => {
    const matchCat =
      selectedCategory === 'ALL' || p.categoryId === selectedCategory || p.category?.id === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(productSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#0d0f14] p-6 max-w-7xl mx-auto space-y-6 select-none">
      {/* HEADER SALÓN */}
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {t('tables.title', 'Salón y Mesas')}
          </h1>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            {t('tables.subtitle', 'Gestión visual del estado de mesas y toma de comandas.')}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingTable(null);
            setTableForm({ tableNumber: tables.length + 1, capacity: 4 });
            setIsTableModalOpen(true);
          }}
          className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold rounded-2xl shadow-md shadow-orange-500/20 cursor-pointer transition-all active:scale-95"
        >
          {t('tables.addTable', '+ Agregar Mesa')}
        </button>
      </div>

      {/* GRILLA DE MESAS (BLANCO BRILLANTE Y NÍTIDO) */}
      {loading ? (
        <div className="text-center py-20 text-orange-400 font-bold text-sm">
          {t('common.loading', 'Cargando mesas del restaurante...')}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {tables.map((table) => {
            const isOccupied = table.status === 'OCCUPIED';
            return (
              <div
                key={table.id}
                onClick={() => handleOpenTableOrder(table)}
                className={`p-5 rounded-3xl border bg-white transition-all duration-200 cursor-pointer flex flex-col justify-between h-44 shadow-sm hover:shadow-md ${
                  isOccupied
                    ? 'border-rose-300 hover:border-rose-400'
                    : 'border-gray-200 hover:border-orange-400'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                      {t('tables.table', 'MESA')}
                    </span>
                    <h3 className="text-3xl font-black text-gray-900 leading-none mt-1">
                      #{table.tableNumber}
                    </h3>
                  </div>
                  <span
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-xl uppercase tracking-wide border ${
                      isOccupied
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {isOccupied ? t('common.occupied', 'OCUPADA') : t('common.available', 'DISPONIBLE')}
                  </span>
                </div>

                <div className="text-xs text-gray-500 flex items-center gap-1.5 font-medium">
                  <ChairIcon className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>
                    {t('tables.capacity', 'Capacidad')}: <strong className="text-gray-800">{table.capacity} {t('tables.persons', 'personas')}</strong>
                  </span>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <span className="text-orange-600 font-bold text-xs hover:underline">
                    {t('tables.viewOrder', 'Ver comanda ➔')}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTable(table);
                        setTableForm({ tableNumber: table.tableNumber, capacity: table.capacity });
                        setIsTableModalOpen(true);
                      }}
                      className="p-1.5 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                    >
                      <PencilIcon className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (window.confirm(`${t('tables.confirmDelete', '¿Eliminar Mesa')} #${table.tableNumber}?`)) {
                          await deleteTable(table.id);
                          await loadData();
                        }
                      }}
                      className="p-1.5 hover:bg-rose-50 rounded-xl text-gray-400 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <DeleteIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DRAWER LATERAL DE PEDIDOS */}
      {selectedTable && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
          <div className="w-full max-w-5xl bg-white h-full flex flex-col justify-between border-l border-gray-200 shadow-2xl">
            {/* Header Drawer */}
            <div className="p-5 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {t('tables.table', 'Mesa')} #{selectedTable.tableNumber}
                  </h2>
                  <span
                    className={`px-2.5 py-0.5 text-[10px] font-bold rounded-lg uppercase border ${
                      selectedTable.status === 'OCCUPIED' || totalConfirmed > 0
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {selectedTable.status === 'OCCUPIED' || totalConfirmed > 0
                      ? t('common.occupied', 'OCUPADA')
                      : t('common.available', 'DISPONIBLE')}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {t('tables.capacity', 'Capacidad')}: {selectedTable.capacity} {t('tables.persons', 'personas')}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTable(null)}
                className="w-8 h-8 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Contenido Dividido */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
              {/* Columna Izquierda: Comandas */}
              <div className="lg:col-span-5 border-r border-gray-200 p-5 overflow-y-auto space-y-4 bg-gray-50/60">
                {/* 1. Nuevos Platos a Enviar */}
                <div className="bg-white border-2 border-orange-200 rounded-2xl p-4 shadow-xs space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-orange-600 uppercase tracking-wide">
                      {t('tables.stagingTitle', '🔥 Nuevos Platos a Enviar')}
                    </span>
                    <span className="text-xs font-bold text-gray-700">
                      {settings.currency} {totalStaging.toFixed(2)}
                    </span>
                  </div>

                  {stagingCart.length === 0 ? (
                    <p className="text-xs text-gray-400 py-3 text-center italic">
                      {t('tables.stagingEmpty', 'Selecciona platos del menú a la derecha para agregarlos a la comanda.')}
                    </p>
                  ) : (
                    <div className="divide-y divide-gray-100 space-y-2">
                      {stagingCart.map((item) => (
                        <div key={item.product.id} className="pt-2 first:pt-0 flex justify-between items-center">
                          <div className="flex-1 pr-2">
                            <p className="text-xs font-semibold text-gray-800">{item.product.name}</p>
                            <p className="text-[11px] text-orange-600 font-semibold">
                              {settings.currency} {item.product.price.toFixed(2)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleUpdateStagingQuantity(item.product.id, -1)}
                              className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs flex items-center justify-center cursor-pointer"
                            >
                              -
                            </button>
                            <span className="text-xs font-bold text-gray-800 w-4 text-center">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateStagingQuantity(item.product.id, 1)}
                              className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs flex items-center justify-center cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={handleSendToKitchen}
                        disabled={sendingToKitchen}
                        className="w-full mt-3 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <span>👨‍🍳</span>
                        <span>
                          {sendingToKitchen
                            ? t('tables.sending', 'Enviando a Cocina...')
                            : `${t('tables.sendToKitchen', 'Enviar a Cocina')} (${stagingCart.reduce((a, b) => a + b.quantity, 0)} ${t('tables.items', 'ítems')})`}
                        </span>
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. Consumo Confirmado */}
                <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                      {t('tables.confirmedTitle', '📋 Consumo Confirmado en Mesa')}
                    </span>
                    <span className="text-xs font-bold text-gray-500">
                      {settings.currency} {totalConfirmed.toFixed(2)}
                    </span>
                  </div>

                  {confirmedItems.length === 0 ? (
                    <p className="text-xs text-gray-400 py-3 text-center italic">
                      {t('tables.confirmedEmpty', 'No hay consumos previos registrados en esta mesa.')}
                    </p>
                  ) : (
                    <div className="divide-y divide-gray-100 max-h-56 overflow-y-auto space-y-2">
                      {confirmedItems.map((item, idx) => (
                        <div key={idx} className="pt-2 first:pt-0 flex justify-between items-center text-xs">
                          <div>
                            <p className="font-semibold text-gray-800">
                              <span className="text-orange-600 font-bold mr-1">{item.quantity}x</span> {item.name}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              {settings.currency} {item.price.toFixed(2)} c/u
                            </p>
                          </div>
                          <span className="font-bold text-gray-800">
                            {settings.currency} {(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Columna Derecha: Catálogo */}
              <div className="lg:col-span-7 p-5 flex flex-col justify-between overflow-y-auto space-y-4 bg-white">
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                    {t('tables.catalogTitle', 'Carta del Restaurante')}
                  </h3>

                  <input
                    type="text"
                    placeholder={t('tables.searchPlates', '🔍 Buscar plato o bebida...')}
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 outline-none focus:border-orange-500"
                  />

                  <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('ALL')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                        selectedCategory === 'ALL'
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {t('tables.allCategories', 'Todas')}
                    </button>
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedCategory(c.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                          selectedCategory === c.id
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[48vh] overflow-y-auto pr-1">
                    {filteredProducts.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleAddToStaging(p)}
                        className="p-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-left flex justify-between items-center transition-all cursor-pointer shadow-xs active:scale-98"
                      >
                        <div>
                          <p className="text-xs font-bold text-gray-800">{p.name}</p>
                          <p className="text-xs font-black text-orange-600 mt-0.5">
                            {settings.currency} {p.price.toFixed(2)}
                          </p>
                        </div>
                        <span className="w-6 h-6 bg-orange-50 text-orange-600 border border-orange-200 rounded-lg flex items-center justify-center font-bold text-xs">
                          +
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Barra Inferior */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-gray-500 font-bold uppercase">
                  {t('tables.totalAccount', 'Total Cuenta:')}
                </span>
                <span className="text-2xl font-black text-gray-900">
                  {settings.currency} {totalGeneral.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  disabled={totalGeneral === 0}
                  onClick={() => setIsPrecuentaModalOpen(true)}
                  className="flex-1 sm:flex-none px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer disabled:opacity-40 flex items-center justify-center gap-1.5"
                >
                  <PrintIcon className="w-3.5 h-3.5" />
                  <span>{t('tables.billPreview', 'Sacar Precuenta')}</span>
                </button>

                <button
                  type="button"
                  disabled={totalGeneral === 0}
                  onClick={() => {
                    setCashReceived(totalGeneral.toFixed(2));
                    setIsPaymentModalOpen(true);
                  }}
                  className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer disabled:opacity-40 flex items-center justify-center gap-1.5"
                >
                  <CardIcon className="w-3.5 h-3.5" />
                  <span>{t('tables.checkoutBtn', 'Cobrar / Cerrar Mesa')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedTable(null)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  {t('tables.closePanel', 'Cerrar Panel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PRECUENTA */}
      {isPrecuentaModalOpen && selectedTable && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#f8f9fc] text-gray-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4 font-mono border border-gray-200">
            <div className="text-center border-b pb-3 border-gray-200">
              <h3 className="font-bold text-base uppercase">{settings.name}</h3>
              <p className="text-[11px] text-gray-500">{settings.slogan}</p>
              <p className="text-xs font-bold mt-2 text-orange-600">
                {t('tables.billTitle', 'PRECUENTA')} - {t('tables.table', 'MESA')} #{selectedTable.tableNumber}
              </p>
              <p className="text-[10px] text-gray-400">{new Date().toLocaleString()}</p>
            </div>

            <div className="divide-y divide-gray-200 text-xs max-h-60 overflow-y-auto py-2">
              {[
                ...confirmedItems,
                ...stagingCart.map((i) => ({
                  name: i.product.name,
                  quantity: i.quantity,
                  price: i.product.price,
                })),
              ].map((item, idx) => (
                <div key={idx} className="py-1.5 flex justify-between">
                  <span>{item.quantity}x {item.name}</span>
                  <span className="font-bold">
                    {settings.currency} {(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-3 flex justify-between text-base font-bold">
              <span>{t('tables.totalToPay', 'TOTAL A PAGAR:')}</span>
              <span className="text-orange-600">{settings.currency} {totalGeneral.toFixed(2)}</span>
            </div>

            <div className="flex gap-2 pt-2 border-t border-gray-200">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                <PrintIcon className="w-4 h-4" />
                <span>{t('tables.printTicket', 'Imprimir Ticket')}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsPrecuentaModalOpen(false)}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-xl cursor-pointer hover:bg-gray-100"
              >
                {t('common.close', 'Cerrar')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL COBRO Y CIERRE */}
      {isPaymentModalOpen && selectedTable && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#f8f9fc] text-gray-900 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800">
              {t('tables.checkoutTitle', 'Cobrar y Liberar Mesa')} #{selectedTable.tableNumber}
            </h3>

            <div className="bg-white p-4 rounded-2xl flex justify-between items-center border border-gray-200 shadow-xs">
              <span className="text-xs font-bold text-gray-500">{t('tables.totalToPay', 'Total a Cancelar:')}</span>
              <span className="text-2xl font-black text-emerald-600">
                {settings.currency} {totalGeneral.toFixed(2)}
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">
                {t('tables.paymentMethod', 'Método de Pago')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('EFECTIVO')}
                  className={`py-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    paymentMethod === 'EFECTIVO'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-xs'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <CashIcon className="w-4 h-4" />
                  <span>{t('tables.cash', 'Efectivo')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('TARJETA')}
                  className={`py-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    paymentMethod === 'TARJETA'
                      ? 'bg-orange-50 border-orange-500 text-orange-600 shadow-xs'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <CardIcon className="w-4 h-4" />
                  <span>{t('tables.card', 'Tarjeta / POS')}</span>
                </button>
              </div>
            </div>

            {paymentMethod === 'EFECTIVO' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  {t('tables.receivedCash', 'Efectivo Recibido')}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-sm font-bold outline-none focus:border-emerald-500"
                />
                {Number(cashReceived) >= totalGeneral && (
                  <p className="text-xs font-bold text-emerald-600 mt-1">
                    {t('tables.change', 'Vuelto:')} {settings.currency} {(Number(cashReceived) - totalGeneral).toFixed(2)}
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="flex-1 py-2 bg-white border border-gray-200 text-gray-600 text-xs font-bold rounded-xl cursor-pointer hover:bg-gray-100"
              >
                {t('common.cancel', 'Cancelar')}
              </button>
              <button
                type="button"
                onClick={handleConfirmPayment}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs uppercase"
              >
                {t('tables.confirmPayment', '✓ Confirmar Pago')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NUEVA/EDITAR MESA */}
      {isTableModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-[#f8f9fc] text-gray-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800">
              {editingTable ? t('tables.editTableTitle', 'Editar Mesa') : t('tables.newTableTitle', 'Nueva Mesa')}
            </h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (editingTable) {
                  await updateTable(editingTable.id, tableForm);
                } else {
                  await createTable(tableForm);
                }
                setIsTableModalOpen(false);
                await loadData();
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">
                  {t('tables.tableNumberLabel', 'Número de Mesa')}
                </label>
                <input
                  type="number"
                  required
                  value={tableForm.tableNumber}
                  onChange={(e) => setTableForm({ ...tableForm, tableNumber: Number(e.target.value) })}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-sm font-semibold outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">
                  {t('tables.tableCapacityLabel', 'Capacidad (Personas)')}
                </label>
                <input
                  type="number"
                  required
                  value={tableForm.capacity}
                  onChange={(e) => setTableForm({ ...tableForm, capacity: Number(e.target.value) })}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-sm font-semibold outline-none focus:border-orange-500"
                />
              </div>
              <div className="flex gap-2 pt-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsTableModalOpen(false)}
                  className="flex-1 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-xl cursor-pointer hover:bg-gray-100"
                >
                  {t('common.cancel', 'Cancelar')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs"
                >
                  {t('common.save', 'Guardar')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TablesDashboard;