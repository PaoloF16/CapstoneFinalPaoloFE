// src/pages/MenuAdminPage.tsx
import React, { useEffect, useState } from 'react';
import type { MenuItem, Category, MenuItemFormData } from '../types/menu';
import { menuService } from '../services/menuService';
import ProductModal from '../components/menu/ProductModal';
import { DeleteConfirmModal } from '../components/menu/DeleteConfirmModal';

export const MenuAdminPage: React.FC = () => {
  const [products, setProducts] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

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
      console.error('Error cargando carta:', error);
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
      console.error('Error al cambiar estado:', error);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'ALL' || p.categoryId === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-4 bg-gray-100 min-h-full p-4">
      {/* Top Toteat Navigation Bar */}
      <div className="bg-red-500 text-white rounded-lg p-3 flex flex-wrap items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 font-bold text-sm">
          <span>Gestión de Productos / Carta</span>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
          className="bg-black hover:bg-gray-900 text-white px-4 py-1.5 rounded-md text-xs font-bold transition-colors shadow-sm"
        >
          + Agregar Producto
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors whitespace-nowrap ${
              selectedCategory === 'ALL'
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            TODOS
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.name.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="w-full md:w-64">
          <input
            type="text"
            placeholder="Filtrar por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
          />
        </div>
      </div>

      {/* Products Table - Toteat Style */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs font-bold text-gray-400">
            Cargando catálogo de productos...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase font-bold text-[11px]">
                  <th className="py-3 px-4">Producto</th>
                  <th className="py-3 px-4">Categoría</th>
                  <th className="py-3 px-4 text-right">Precio Actual</th>
                  <th className="py-3 px-4 text-center">Etiquetas</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      !product.isAvailable ? 'bg-gray-50/50 opacity-60' : ''
                    }`}
                  >
                    {/* Item Info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            product.imageUrl ||
                            'https://via.placeholder.com/80?text=Food'
                          }
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded-md border border-gray-200"
                        />
                        <div>
                          <p className="font-bold text-gray-800">{product.name}</p>
                          <p className="text-[11px] text-gray-400 line-clamp-1 max-w-xs">
                            {product.description}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 text-gray-600 font-medium">
                      {categories.find((c) => c.id === product.categoryId)?.name ||
                        'General'}
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4 text-right font-extrabold text-red-500">
                      ${product.price.toLocaleString()}
                      {product.originalPrice && (
                        <span className="block text-[10px] text-gray-400 line-through font-normal">
                          ${product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </td>

                    {/* Tags */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1 flex-wrap">
                        {product.discountBadge && (
                          <span className="bg-red-100 text-red-600 font-bold text-[9px] px-1.5 py-0.5 rounded">
                            {product.discountBadge}
                          </span>
                        )}
                        {product.isNew && (
                          <span className="bg-amber-100 text-amber-700 font-bold text-[9px] px-1.5 py-0.5 rounded">
                            NUEVO
                          </span>
                        )}
                        {product.isGlutenFree && (
                          <span className="bg-emerald-100 text-emerald-700 font-bold text-[9px] px-1.5 py-0.5 rounded">
                            SIN GLUTEN
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Availability */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(product)}
                        className={`px-2 py-1 rounded text-[10px] font-bold ${
                          product.isAvailable
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                            : 'bg-gray-100 text-gray-500 border border-gray-200'
                        }`}
                      >
                        {product.isAvailable ? 'ACTIVO' : 'PAUSADO'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        onClick={() => {
                          setEditingProduct(product);
                          setIsModalOpen(true);
                        }}
                        className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-semibold"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => {
                          setDeletingProductId(product.id);
                          setIsDeleteModalOpen(true);
                        }}
                        className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded text-xs font-semibold"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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

export default MenuAdminPage;