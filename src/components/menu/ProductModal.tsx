import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useRestaurant } from '../../context/RestaurantContext';
import type { MenuItem, Category, MenuItemFormData } from '../../types/menu';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MenuItemFormData) => Promise<void>;
  initialData?: MenuItem | null;
  categories: Category[];
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  categories,
}) => {
  const { t } = useLanguage();
  const { settings } = useRestaurant();

  const [formData, setFormData] = useState<MenuItemFormData>({
    name: '',
    description: '',
    price: 0,
    originalPrice: undefined,
    categoryId: '',
    imageUrl: '',
    discountBadge: '',
    isNew: false,
    isGlutenFree: false,
    isAvailable: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        price: initialData.price || 0,
        originalPrice: initialData.originalPrice,
        categoryId: initialData.categoryId || initialData.category?.id || categories[0]?.id || '',
        imageUrl: initialData.imageUrl || '',
        discountBadge: initialData.discountBadge || '',
        isNew: initialData.isNew || false,
        isGlutenFree: initialData.isGlutenFree || false,
        isAvailable: initialData.isAvailable ?? true,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        originalPrice: undefined,
        categoryId: categories[0]?.id || '',
        imageUrl: '',
        discountBadge: '',
        isNew: false,
        isGlutenFree: false,
        isAvailable: true,
      });
    }
  }, [initialData, categories, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.categoryId) return;
    await onSubmit(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-gray-100 space-y-4 max-h-[90vh] overflow-y-auto select-none">
        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
          <h2 className="text-lg font-bold text-gray-800">
            {initialData
              ? t('productModal.editTitle', 'Editar Plato')
              : t('productModal.createTitle', 'Crear Nuevo Plato')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              {t('productModal.nameLabel', 'NOMBRE DEL PLATO')}
            </label>
            <input
              type="text"
              required
              placeholder={t('productModal.namePlaceholder', 'Ej. Lomo Saltado')}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              {t('productModal.categoryLabel', 'CATEGORÍA')}
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold outline-none focus:border-blue-500 bg-white"
              required
            >
              <option value="">{t('productModal.selectCategory', '-- Seleccionar Categoría --')}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                {t('productModal.priceLabel', 'PRECIO')} ({settings.currency})
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                {t('productModal.originalPriceLabel', 'PRECIO ANTERIOR')} ({settings.currency})
              </label>
              <input
                type="number"
                step="0.01"
                placeholder={t('productModal.optionalPlaceholder', 'Opcional')}
                value={formData.originalPrice ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    originalPrice: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="w-full p-2.5 border border-gray-300 rounded-xl text-xs outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              {t('productModal.descLabel', 'DESCRIPCIÓN')}
            </label>
            <textarea
              rows={2}
              placeholder={t('productModal.descPlaceholder', 'Ingredientes o detalles...')}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2.5 border border-gray-300 rounded-xl text-xs outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              {t('productModal.imageLabel', 'URL IMAGEN (OPCIONAL)')}
            </label>
            <input
              type="url"
              placeholder="https://..."
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full p-2.5 border border-gray-300 rounded-xl text-xs outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                {t('productModal.discountLabel', 'ETIQUETA DESCUENTO')}
              </label>
              <input
                type="text"
                placeholder={t('productModal.discountPlaceholder', 'Ej. -15%')}
                value={formData.discountBadge}
                onChange={(e) => setFormData({ ...formData, discountBadge: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-xl text-xs outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex gap-4 pt-4 sm:pt-0">
              <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isNew}
                  onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>{t('productModal.isNew', 'NUEVO')}</span>
              </label>

              <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isGlutenFree}
                  onChange={(e) => setFormData({ ...formData, isGlutenFree: e.target.checked })}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span>{t('productModal.isGlutenFree', 'SIN GLUTEN')}</span>
              </label>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <label className="flex items-center gap-2 text-xs font-bold text-gray-800 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isAvailable}
                onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span>{t('productModal.isAvailable', 'Plato disponible para venta')}</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
            >
              {t('common.cancel', 'Cancelar')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
            >
              {t('productModal.saveBtn', 'Guardar Plato')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;