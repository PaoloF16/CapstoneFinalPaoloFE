import React, { useEffect, useState } from 'react';
import { menuService } from '../services/menuService';
import { ProductModal } from '../components/menu/ProductModal';
import { CategoryModal } from '../components/menu/CategoryModal';
import { useLanguage } from '../context/LanguageContext';
import { useRestaurant } from '../context/RestaurantContext';
import { PencilIcon, DeleteIcon } from '../components/common/Icons';
import type { MenuItem, Category, MenuItemFormData, CategoryFormData } from '../types/menu';

export const MenuAdminPage: React.FC = () => {
  const { t } = useLanguage();
  const { settings } = useRestaurant();

  const [products, setProducts] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<MenuItem | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [cats, prods] = await Promise.all([
        menuService.getCategories(),
        menuService.getProducts(),
      ]);
      setCategories(Array.isArray(cats) ? cats : []);
      setProducts(Array.isArray(prods) ? prods : []);
    } catch (err: any) {
      console.error('Error al cargar datos del menú:', err);
      setError('No se pudo conectar con el servidor backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreateProduct = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (product: MenuItem) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (formData: MenuItemFormData) => {
    if (editingProduct) {
      await menuService.updateProduct(editingProduct.id, formData);
    } else {
      await menuService.createProduct(formData);
    }
    await fetchData();
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar "${name}"?`)) {
      try {
        await menuService.deleteProduct(id);
        await fetchData();
      } catch (err) {
        console.error('Error al eliminar producto:', err);
        alert('Error al eliminar el producto.');
      }
    }
  };

  const handleToggleAvailability = async (id: string, currentStatus: boolean) => {
    try {
      await menuService.toggleAvailability(id, !currentStatus);
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isAvailable: !currentStatus } : p))
      );
    } catch (err) {
      console.error('Error al cambiar disponibilidad:', err);
      fetchData();
    }
  };

  const handleSaveCategory = async (data: CategoryFormData) => {
    await menuService.createCategory(data);
    await fetchData();
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (confirm(`¿Eliminar la categoría "${name}" y sus platos asociados?`)) {
      try {
        await menuService.deleteCategory(id);
        if (selectedCategoryId === id) setSelectedCategoryId('ALL');
        await fetchData();
      } catch (err) {
        console.error('Error al eliminar categoría:', err);
        alert('Error al eliminar la categoría.');
      }
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategoryId === 'ALL' ||
      p.categoryId === selectedCategoryId ||
      p.category?.id === selectedCategoryId;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#0d0f14] p-6 max-w-7xl mx-auto space-y-6 select-none relative">
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER DE LA CARTA (BLANCO) */}
      <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-3xl border border-gray-200/80 shadow-md gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            {t('menu.title', 'Carta / Gestión de Platos')}
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            {settings.name} — {t('menu.subtitle', 'Administra platos, precios y categorías.')} ({settings.currency})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCategoryModalOpen(true)}
            className="px-4 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-2xl shadow-xs transition-colors cursor-pointer"
          >
            {t('menu.newCategory', '+ Nueva Categoría')}
          </button>
          <button
            type="button"
            onClick={handleOpenCreateProduct}
            className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white font-bold text-xs rounded-2xl shadow-md shadow-orange-500/20 transition-all cursor-pointer"
          >
            {t('menu.newProduct', 'Nuevo Plato')}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl flex justify-between items-center shadow-xs">
          <span>⚠️ {error}</span>
          <button
            type="button"
            onClick={fetchData}
            className="px-3 py-1 bg-rose-600 text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* FILTROS Y CATEGORÍAS */}
      <div className="relative z-10 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategoryId('ALL')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategoryId === 'ALL'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-xs'
            }`}
          >
            {t('menu.allCategory', 'Todos')} ({products.length})
          </button>

          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center group">
              <button
                type="button"
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategoryId === cat.id
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-xs'
                }`}
              >
                {cat.name}
              </button>
              <button
                type="button"
                onClick={() => handleDeleteCategory(cat.id, cat.name)}
                className="hidden group-hover:block ml-1 text-gray-400 hover:text-rose-500 text-xs p-1 cursor-pointer"
                title="Eliminar categoría"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Buscador */}
        <div className="w-full md:w-72">
          <input
            type="text"
            placeholder={`🔍 ${t('menu.searchPlaceholder', 'Buscar plato por nombre...')}`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-2.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-orange-500 shadow-xs font-medium"
          />
        </div>
      </div>

      {/* GRILLA DE PLATOS (TARJETAS BLANCAS) */}
      {loading ? (
        <div className="p-20 text-center text-orange-400 font-bold text-sm">
          {t('common.loading', 'Cargando platos...')}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center space-y-2 shadow-xs">
          <p className="text-3xl">🍽️</p>
          <h3 className="font-bold text-gray-800">No hay platos registrados</h3>
          <p className="text-xs text-gray-400">Crea tu primer plato con el botón "Nuevo Plato".</p>
        </div>
      ) : (
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className={`bg-white rounded-3xl border border-gray-200/90 transition-all overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md ${
                product.isAvailable ? '' : 'opacity-60 bg-gray-50'
              }`}
            >
              <div>
                <div className="h-36 w-full bg-gray-100 relative overflow-hidden border-b border-gray-100">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl font-black">
                      {settings.logoInitial}
                    </div>
                  )}

                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                    {product.isNew && (
                      <span className="bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow-xs">
                        NUEVO
                      </span>
                    )}
                    {product.discountBadge && (
                      <span className="bg-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow-xs">
                        {product.discountBadge}
                      </span>
                    )}
                  </div>

                  {product.isGlutenFree && (
                    <span className="absolute top-2.5 right-2.5 bg-amber-100 border border-amber-300 text-amber-800 text-[9px] font-black px-1.5 py-0.5 rounded-md">
                      SIN GLUTEN
                    </span>
                  )}
                </div>

                <div className="p-4 space-y-1.5">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-sm text-gray-900 leading-tight">
                      {product.name}
                    </h3>
                    <span className="text-[10px] text-gray-400 font-extrabold uppercase shrink-0">
                      {product.category?.name || 'General'}
                    </span>
                  </div>

                  {product.description && (
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-4 pt-0 space-y-3">
                <div className="flex items-baseline gap-2 pt-2 border-t border-gray-100">
                  <span className="text-lg font-black text-gray-900">
                    {settings.currency} {product.price.toFixed(2)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-xs text-gray-400 line-through font-semibold">
                      {settings.currency} {product.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => handleToggleAvailability(product.id, product.isAvailable)}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase cursor-pointer transition-colors ${
                      product.isAvailable
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {product.isAvailable
                      ? `✓ ${t('menu.available', 'Disponible')}`
                      : `✕ ${t('menu.outOfStock', 'Agotado')}`}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEditProduct(product)}
                      className="p-1.5 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-700 cursor-pointer transition-colors"
                    >
                      <PencilIcon className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(product.id, product.name)}
                      className="p-1.5 hover:bg-rose-50 rounded-xl text-gray-400 hover:text-rose-600 cursor-pointer transition-colors"
                    >
                      <DeleteIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleSaveProduct}
        initialData={editingProduct}
        categories={categories}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSubmit={handleSaveCategory}
      />
    </div>
  );
};

export default MenuAdminPage;