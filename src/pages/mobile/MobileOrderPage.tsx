// src/pages/mobile/MobileOrderPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { menuService } from '../../services/menuService';
import { getTables, createOrder } from '../../services/restaurantService';
import { useRestaurant } from '../../context/RestaurantContext'; // 👈 Importamos Contexto
import type { RestaurantTable } from '../../types/restaurant';
import type { MenuItem as MenuItemType, Category } from '../../types/menu';

interface QuickCartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export const MobileOrderPage: React.FC = () => {
  const { tableId } = useParams<{ tableId: string }>();
  const navigate = useNavigate();
  const { settings } = useRestaurant(); // 👈 Moneda y Datos del Restaurante

  const [table, setTable] = useState<RestaurantTable | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<MenuItemType[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [cart, setCart] = useState<QuickCartItem[]>([]);
  const [sending, setSending] = useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  useEffect(() => {
    const initData = async () => {
      if (!tableId) return;
      try {
        const allTables = await getTables();
        const currentTable = allTables.find((t) => t.id === tableId) || null;
        setTable(currentTable);

        const [cats, prods] = await Promise.all([
          menuService.getCategories(),
          menuService.getProducts(),
        ]);
        setCategories(cats);
        setProducts(prods.filter((p) => p.isAvailable));
      } catch (err) {
        console.error('Error al inicializar comandera:', err);
      }
    };

    initData();
  }, [tableId]);

  const handleQuickAdd = (product: MenuItemType) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
        },
      ];
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as QuickCartItem[]
    );
  };

  const handleSendToKitchen = async () => {
    if (!tableId || cart.length === 0) return;

    try {
      setSending(true);
      const payloadItems = cart.map((c) => ({
        productId: c.id,
        quantity: c.quantity,
      }));

      await createOrder({
        tableId,
        items: payloadItems,
      });

      setCart([]);
      navigate('/mobile/tables');
    } catch (err) {
      console.error('Error al enviar comanda:', err);
      alert('Error de conexión al enviar comanda a cocina.');
    } finally {
      setSending(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'ALL' ||
      p.categoryId === selectedCategory ||
      p.category?.id === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalItemsCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalAmount = cart.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col font-sans pb-24 select-none">
      {/* Header */}
      <div className="p-3 bg-gray-900 border-b border-gray-800 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <button
          onClick={() => navigate('/mobile/tables')}
          className="text-gray-400 font-bold px-2 py-1 text-sm bg-gray-800 rounded-lg active:scale-95"
        >
          ✕ Salir
        </button>

        <div className="text-center">
          <h2 className="text-base font-black text-white">Mesa #{table?.tableNumber || '...'}</h2>
          <span className="text-[10px] text-gray-400">{settings.name}</span>
        </div>

        <button
          onClick={() => setIsDrawerOpen(true)}
          className="relative px-3 py-1.5 bg-red-600 text-white font-black text-xs rounded-xl active:scale-95 shadow-md shadow-red-600/30 flex items-center gap-1.5"
        >
          <span>🛒</span>
          <span>{totalItemsCount}</span>
        </button>
      </div>

      {/* Buscador */}
      <div className="p-3 bg-gray-900/40 border-b border-gray-800/60">
        <input
          type="text"
          placeholder="🔍 Buscar plato o bebida..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-gray-900 border border-gray-800 text-sm px-3.5 py-2 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
        />
      </div>

      {/* Categorías */}
      <div className="p-2.5 bg-gray-900/20 border-b border-gray-800 flex gap-1.5 overflow-x-auto scrollbar-none sticky top-14 z-20 backdrop-blur-md">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
            selectedCategory === 'ALL'
              ? 'bg-red-600 text-white shadow-md'
              : 'bg-gray-900 text-gray-400 border border-gray-800'
          }`}
        >
          Todo ({products.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              selectedCategory === cat.id
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-gray-900 text-gray-400 border border-gray-800'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Catálogo */}
      <div className="p-3.5 grid grid-cols-2 gap-2.5 flex-1">
        {filteredProducts.map((prod) => {
          const inCart = cart.find((i) => i.id === prod.id);
          return (
            <button
              key={prod.id}
              onClick={() => handleQuickAdd(prod)}
              className={`relative p-3 rounded-2xl border text-left flex flex-col justify-between min-h-[92px] active:scale-95 transition-all shadow-sm cursor-pointer ${
                inCart
                  ? 'bg-red-950/30 border-red-500/60 shadow-red-900/20'
                  : 'bg-gray-900 border-gray-800 hover:border-gray-700'
              }`}
            >
              {inCart && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white font-black text-xs w-6 h-6 rounded-full flex items-center justify-center shadow-md">
                  {inCart.quantity}
                </span>
              )}

              <div>
                <h4 className="font-bold text-sm text-gray-100 line-clamp-2 leading-tight">
                  {prod.name}
                </h4>
                {prod.isGlutenFree && (
                  <span className="text-[9px] text-amber-400 font-bold">Sin Gluten</span>
                )}
              </div>

              <div className="flex justify-between items-end mt-2 pt-1 border-t border-gray-800/60">
                <span className="text-red-400 font-black text-sm">
                  {settings.currency} {prod.price.toFixed(2)}
                </span>
                <span className="w-6 h-6 rounded-lg bg-gray-800 border border-gray-700 text-white flex items-center justify-center font-bold text-sm">
                  +
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Barra Inferior */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 bg-gray-900/95 border-t border-gray-800 p-3 flex gap-3 items-center z-30 backdrop-blur-md">
          <div onClick={() => setIsDrawerOpen(true)} className="flex-1 cursor-pointer">
            <span className="text-[10px] text-gray-400 block font-bold uppercase">
              {totalItemsCount} ítems nuevos
            </span>
            <span className="text-lg font-black text-white">
              {settings.currency} {totalAmount.toFixed(2)}
            </span>
          </div>

          <button
            onClick={handleSendToKitchen}
            disabled={sending}
            className="px-6 py-3.5 bg-red-600 active:bg-red-700 text-white font-black text-sm rounded-xl shadow-lg shadow-red-600/40 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>👨‍🍳</span>
            <span>{sending ? 'Enviando...' : 'Enviar a Cocina'}</span>
          </button>
        </div>
      )}

      {/* Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-sm bg-gray-900 h-full flex flex-col justify-between p-4 border-l border-gray-800 animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-800">
                <h3 className="font-bold text-base text-white">Comanda Mesa #{table?.tableNumber}</h3>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="text-gray-400 font-bold text-lg p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="divide-y divide-gray-800 mt-2 max-h-[65vh] overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="py-3 flex justify-between items-center">
                    <div className="flex-1 pr-2">
                      <p className="font-bold text-sm text-gray-100">{item.name}</p>
                      <p className="text-xs text-gray-400">
                        {settings.currency} {item.price.toFixed(2)} c/u
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, -1)}
                        className="w-8 h-8 rounded-lg bg-gray-800 border border-gray-700 text-white font-black active:scale-95 flex items-center justify-center cursor-pointer"
                      >
                        -
                      </button>
                      <span className="font-black text-sm w-5 text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, 1)}
                        className="w-8 h-8 rounded-lg bg-gray-800 border border-gray-700 text-white font-black active:scale-95 flex items-center justify-center cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-gray-800 space-y-3">
              <div className="flex justify-between items-center text-base font-black">
                <span className="text-gray-300">Total Comanda:</span>
                <span className="text-red-400">{settings.currency} {totalAmount.toFixed(2)}</span>
              </div>
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  handleSendToKitchen();
                }}
                disabled={sending}
                className="w-full py-3.5 bg-red-600 text-white font-black rounded-xl text-sm shadow-md active:scale-95 cursor-pointer"
              >
                {sending ? 'Enviando...' : 'Confirmar y Enviar a Cocina ➔'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};