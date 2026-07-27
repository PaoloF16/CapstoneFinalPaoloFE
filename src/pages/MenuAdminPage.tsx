// src/pages/MenuAdminPage.tsx
import React, { useEffect, useState } from 'react';
import { menuService } from '../services/menuService';
import { ProductModal } from '../components/menu/ProductModal';
import { CategoryModal } from '../components/menu/CategoryModal';
import type { MenuItem, Category, MenuItemFormData, CategoryFormData } from '../types/menu';

export const MenuAdminPage: React.FC = () => {
  // --- ESTADOS LOCALES ---
  const [products, setProducts] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);

  // Modales
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<MenuItem | null>(null);

  // --- CARGA DE DATOS ---
  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        menuService.getProducts(),
        menuService.getCategories(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error al cargar datos del menú:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- MANEJADORES DE CATEGORÍAS ---
  const handleCreateCategory = async (formData: CategoryFormData) => {
    await menuService.createCategory(formData);
    await fetchData();
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm('¿Seguro que deseas eliminar esta categoría?')) {
      await menuService.deleteCategory(id);
      await fetchData();
    }
  };

  // --- MANEJADORES DE PRODUCTOS ---
  const handleCreateOrUpdateProduct = async (formData: MenuItemFormData) => {
    if (editingProduct) {
      await menuService.updateProduct(editingProduct.id, formData);
    } else {
      await menuService.createProduct(formData);
    }
    await fetchData();
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('¿Seguro que deseas eliminar este producto?')) {
      await menuService.deleteProduct(id);
      await fetchData();
    }
  };

  const handleToggleAvailability = async (id: string, currentStatus: boolean) => {
    await menuService.toggleAvailability(id, !currentStatus);
    await fetchData();
  };

  // --- FILTRADO DE PRODUCTOS ---
  const filteredProducts = selectedCategoryId === 'ALL'
    ? products
    : products.filter((p) => p.categoryId === selectedCategoryId || p.category?.id === selectedCategoryId);

  return (
    <div className="p-6">
      
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Administración de Carta / Menú</h1>
          <p className="text-sm text-gray-500">Crea categorías y gestiona la oferta gastronómica</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="px-4 py-2 bg-gray-800 hover:bg-black text-white font-bold text-sm rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            + Nueva Categoría
          </button>
          <button
            onClick={() => {
              if (categories.length === 0) {
                alert('Debes crear al menos una categoría antes de añadir platos.');
                setIsCategoryModalOpen(true);
                return;
              }
              setEditingProduct(null);
              setIsProductModalOpen(true);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            + Añadir Plato
          </button>
        </div>
      </div>

      {/* Lista de Categorías Pill Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
        <button
          onClick={() => setSelectedCategoryId('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
            selectedCategoryId === 'ALL'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Todas las categorías ({products.length})
        </button>

        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center gap-1">
            <button
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                selectedCategoryId === cat.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {cat.name}
            </button>
            <button
              onClick={() => handleDeleteCategory(cat.id)}
              title="Eliminar categoría"
              className="text-red-400 hover:text-red-600 text-xs px-1 font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Grilla de Platos / Productos */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Cargando la carta...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-gray-200 max-w-md mx-auto">
          <p className="text-gray-500 mb-4 font-medium">No hay platos registrados en esta categoría.</p>
          <button
            onClick={() => setIsProductModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-lg cursor-pointer"
          >
            + Crear Plato
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="p-4">
                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-36 object-cover rounded-xl mb-3"
                  />
                )}
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-800 text-base">{product.name}</h3>
                  <span className="font-extrabold text-blue-600 text-base">
                    S/ {product.price.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2 mb-3">{product.description}</p>
                <div className="flex gap-2 text-[10px]">
                  {product.isGlutenFree && (
                    <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">
                      SIN GLUTEN
                    </span>
                  )}
                  <span
                    className={`px-2 py-0.5 rounded font-bold ${
                      product.isAvailable
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {product.isAvailable ? 'Disponible' : 'Agotado'}
                  </span>
                </div>
              </div>

              {/* Acciones del Plato */}
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                <button
                  onClick={() => handleToggleAvailability(product.id, product.isAvailable)}
                  className="text-xs font-bold text-gray-600 hover:text-black cursor-pointer"
                >
                  {product.isAvailable ? 'Pausar' : 'Activar'}
                </button>
                <div className="space-x-3">
                  <button
                    onClick={() => {
                      setEditingProduct(product);
                      setIsProductModalOpen(true);
                    }}
                    className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="text-xs font-bold text-red-500 hover:underline cursor-pointer"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para Crear Categoría */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSubmit={handleCreateCategory}
      />

      {/* Modal para Crear / Editar Producto */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSubmit={handleCreateOrUpdateProduct}
        initialData={editingProduct}
        categories={categories}
      />

    </div>
  );
};