// src/pages/MenuAdminPage.tsx
import React, { useEffect, useState } from "react"
import { menuService } from "../services/menuService"
import { ProductModal } from "../components/menu/ProductModal"
import { CategoryModal } from "../components/menu/CategoryModal"
import { useLanguage } from "../context/LanguageContext"
import { useRestaurant } from "../context/RestaurantContext"
import type {
  MenuItem,
  Category,
  MenuItemFormData,
  CategoryFormData,
} from "../types/menu"
import { DeleteIcon, PencilIcon } from "../components/common/Icons"

export const MenuAdminPage: React.FC = () => {
  const { t } = useLanguage()
  const { settings } = useRestaurant()

  // --- ESTADOS LOCALES ---
  const [products, setProducts] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("ALL")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Modales
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false)
  const [editingProduct, setEditingProduct] = useState<MenuItem | null>(null)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false)

  // Cargar Categorías y Platos
  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [cats, prods] = await Promise.all([
        menuService.getCategories(),
        menuService.getProducts(),
      ])
      setCategories(Array.isArray(cats) ? cats : [])
      setProducts(Array.isArray(prods) ? prods : [])
    } catch (err: any) {
      console.error("Error al cargar datos del menú:", err)
      setError("No se pudo conectar con el servidor backend.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // --- ACCIONES DE PLATOS ---
  const handleOpenCreateProduct = () => {
    setEditingProduct(null)
    setIsProductModalOpen(true)
  }

  const handleOpenEditProduct = (product: MenuItem) => {
    setEditingProduct(product)
    setIsProductModalOpen(true)
  }

  const handleSaveProduct = async (formData: MenuItemFormData) => {
    if (editingProduct) {
      await menuService.updateProduct(editingProduct.id, formData)
    } else {
      await menuService.createProduct(formData)
    }
    await fetchData()
  }

  const handleDeleteProduct = async (id: string, name: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar "${name}"?`)) {
      try {
        await menuService.deleteProduct(id)
        await fetchData()
      } catch (err) {
        console.error("Error al eliminar producto:", err)
        alert("Error al eliminar el producto.")
      }
    }
  }

  const handleToggleAvailability = async (
    id: string,
    currentStatus: boolean,
  ) => {
    try {
      await menuService.toggleAvailability(id, !currentStatus)
      setProducts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, isAvailable: !currentStatus } : p,
        ),
      )
    } catch (err) {
      console.error("Error al cambiar disponibilidad:", err)
      fetchData()
    }
  }

  // --- ACCIONES DE CATEGORÍAS ---
  const handleSaveCategory = async (data: CategoryFormData) => {
    await menuService.createCategory(data)
    await fetchData()
  }

  const handleDeleteCategory = async (id: string, name: string) => {
    if (confirm(`¿Eliminar la categoría "${name}" y sus platos asociados?`)) {
      try {
        await menuService.deleteCategory(id)
        if (selectedCategoryId === id) setSelectedCategoryId("ALL")
        await fetchData()
      } catch (err) {
        console.error("Error al eliminar categoría:", err)
        alert("Error al eliminar la categoría.")
      }
    }
  }

  // Filtrado
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategoryId === "ALL" ||
      p.categoryId === selectedCategoryId ||
      p.category?.id === selectedCategoryId
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description &&
        p.description.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 select-none">
      {/* HEADER DE LA CARTA */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {t("menu.title", "Carta / Gestión de Platos")}
          </h1>
          <p className="text-sm text-gray-500">
            {settings.name} —{" "}
            {t("menu.subtitle", "Administra platos, precios y categorías.")} (
            {settings.currency})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCategoryModalOpen(true)}
            className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            {t("menu.newCategory", "+ Nueva Categoría")}
          </button>
          <button
            type="button"
            onClick={handleOpenCreateProduct}
            className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            {t("menu.newProduct")}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex justify-between items-center shadow-sm">
          <span>⚠️ {error}</span>
          <button
            type="button"
            onClick={fetchData}
            className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* FILTROS Y CATEGORÍAS */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Píldoras de Categorías */}
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategoryId("ALL")}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategoryId === "ALL"
                ? "bg-red-600 text-white shadow-sm"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {t("menu.allCategory", "Todos")} ({products.length})
          </button>

          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center group">
              <button
                type="button"
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategoryId === cat.id
                    ? "bg-red-600 text-white shadow-sm"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {cat.name}
              </button>
              <button
                type="button"
                onClick={() => handleDeleteCategory(cat.id, cat.name)}
                className="hidden group-hover:block ml-1 text-gray-400 hover:text-red-600 text-xs p-1 cursor-pointer"
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
            placeholder={`🔍 ${t("menu.searchPlaceholder", "Buscar plato por nombre...")}`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      {/* GRILLA DE PLATOS */}
      {loading ? (
        <div className="p-12 text-center text-gray-500 font-medium">
          {t("common.loading", "Cargando platos...")}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center space-y-2">
          <p className="text-2xl">🍽️</p>
          <h3 className="font-bold text-gray-700">No hay platos registrados</h3>
          <p className="text-xs text-gray-500">
            Crea tu primer plato con el botón "Nuevo Plato".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className={`bg-white rounded-2xl border transition-all overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md ${
                product.isAvailable
                  ? "border-gray-200"
                  : "border-gray-200 opacity-60 bg-gray-50"
              }`}
            >
              <div>
                {/* Imagen o Placeholder */}
                <div className="h-36 w-full bg-gray-100 relative overflow-hidden border-b border-gray-100">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        ;(e.target as HTMLElement).style.display = "none"
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl font-black">
                      {settings.logoInitial}
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {product.isNew && (
                      <span className="bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow-xs">
                        NUEVO
                      </span>
                    )}
                    {product.discountBadge && (
                      <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow-xs">
                        {product.discountBadge}
                      </span>
                    )}
                  </div>

                  {product.isGlutenFree && (
                    <span className="absolute top-2 right-2 bg-amber-100 border border-amber-300 text-amber-800 text-[9px] font-black px-1.5 py-0.5 rounded-md">
                      SIN GLUTEN
                    </span>
                  )}
                </div>

                {/* Contenido */}
                <div className="p-4 space-y-1.5">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-sm text-gray-800 leading-tight">
                      {product.name}
                    </h3>
                    <span className="text-[10px] text-gray-400 font-extrabold uppercase shrink-0">
                      {product.category?.name || "General"}
                    </span>
                  </div>

                  {product.description && (
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Precios y Botones */}
              <div className="p-4 pt-0 space-y-3">
                <div className="flex items-baseline gap-2 pt-2 border-t border-gray-100">
                  <span className="text-lg font-black text-gray-900">
                    {settings.currency} {product.price.toFixed(2)}
                  </span>
                  {product.originalPrice &&
                    product.originalPrice > product.price && (
                      <span className="text-xs text-gray-400 line-through font-semibold">
                        {settings.currency} {product.originalPrice.toFixed(2)}
                      </span>
                    )}
                </div>

                {/* Acciones */}
                <div className="flex items-center justify-between gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      handleToggleAvailability(product.id, product.isAvailable)
                    }
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase cursor-pointer transition-colors ${
                      product.isAvailable
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {product.isAvailable
                      ? `✓ ${t("menu.available", "Disponible")}`
                      : `✕ ${t("menu.outOfStock", "Agotado")}`}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEditProduct(product)}
                      className="px-2.5 py-1 bg-gray-100 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      <PencilIcon className="w-3.5 h-3.5"/>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteProduct(product.id, product.name)
                      }
                      className="px-2.5 py-1 bg-gray-100 hover:bg-red-50 hover:text-red-600 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      <DeleteIcon className="w-3.5 h-3.5"/>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modales */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false)
          setEditingProduct(null)
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
  )
}

export default MenuAdminPage
