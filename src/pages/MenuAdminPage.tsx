// src/pages/MenuAdminPage.tsx
import React, { useEffect, useState } from 'react';
import type { MenuItem, Category, MenuItemFormData } from '../types/menu';
import { menuService } from '../services/menuService';
import { ProductModal } from '../components/menu/ProductModal';
import { DeleteConfirmModal } from '../components/menu/DeleteConfirmModal';

export const MenuAdminPage: React.FC = () => {
  const [products, setProducts] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<MenuItem | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [catsRes, prodsRes] = await Promise.all([
        menuService.getCategories(),
        menuService.getProducts(),
      ]);
      setCategories(catsRes);
      setProducts(prodsRes);
    } catch (error) {
      console.error('Error cargando menú:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateOrUpdate = async (data: MenuItemFormData) => {
    if (editingProduct) {
      const updated = await menuService.updateProduct(editingProduct.id, data);
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } else {
      const created = await menuService.createProduct(data);
      setProducts((prev) => [...prev, created]);
    }
  };

  const handleDelete = async () => {
    if (!deletingProductId) return;
    try {
      await menuService.deleteProduct(deletingProductId);
      setProducts((prev) => prev.filter((p) => p.id !== deletingProductId));
    } catch (error) {
      console.error('Error al eliminar:', error);
    }
  };

  const handleToggleStatus = async (product: MenuItem) => {
    try {
      const updated = await menuService.toggleAvailability(product.id, !product.isAvailable);
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } catch (error) {
      console.error('Error al cambiar disponibilidad:', error);
    }
  };

  const filteredProducts = selectedCategory === 'ALL'
    ? products
    : products.filter((p) => p.categoryId === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Menú Admin</h1>
          <p className="text-sm text-gray-500">
            Gestión de carta, precios y disponibilidad de productos.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 bg-red-500 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors shadow-sm"
        >
          <span className="text-lg">+</span> Nuevo Plato
        </button>
      </div>

      {/* Category Quick Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${
            selectedCategory === 'ALL'
              ? 'bg-red-500 text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          TODOS
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${
              selectedCategory === cat.id
                ? 'bg-red-500 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {cat.name.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="py-20 text-center text-gray-500 font-medium">Cargando menú...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className={`bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm flex flex-col transition-opacity ${
                !product.isAvailable ? 'opacity-60 bg-gray-50' : ''
              }`}
            >
              {/* Product Card Media & Badges */}
              <div className="relative h-44 bg-gray-100">
                <img
                  src={product.imageUrl || 'https://via.placeholder.com/300x200?text=Sin+Imagen'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                  {product.discountBadge && (
                    <span className="bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded">
                      {product.discountBadge}
                    </span>
                  )}
                  {product.isNew && (
                    <span className="bg-amber-400 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded">
                      NUEVO
                    </span>
                  )}
                  {product.isGlutenFree && (
                    <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded">
                      SIN GLUTEN
                    </span>
                  )}
                </div>
              </div>

              {/* Product Details */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-gray-800 text-base">{product.name}</h3>
                    <div className="text-right">
                      <span className="text-red-500 font-extrabold text-base">
                        ${product.price.toLocaleString()}
                      </span>
                      {product.originalPrice && (
                        <span className="block text-xs text-gray-400 line-through">
                          ${product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">{product.description}</p>
                </div>

                {/* Card Controls & Status Toggle */}
                <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                  <button
                    onClick={() => handleToggleStatus(product)}
                    className={`text-xs px-2.5 py-1 rounded-md font-semibold ${
                      product.isAvailable
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {product.isAvailable ? 'Disponible' : 'Desactivado'}
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingProduct(product);
                        setIsModalOpen(true);
                      }}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-semibold"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        setDeletingProductId(product.id);
                        setIsDeleteModalOpen(true);
                      }}
                      className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded text-xs font-semibold"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        initialData={editingProduct}
        categories={categories}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};