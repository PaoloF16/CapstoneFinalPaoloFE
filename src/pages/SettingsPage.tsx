// src/pages/SettingsPage.tsx
import React, { useState } from 'react';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState({
    restaurantName: 'Toteat Restaurant',
    taxRate: 18,
    suggestedTip: 10,
    currency: 'S/',
    receiptHeader: '¡Gracias por su visita!',
    autoPrintKitchen: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setSettings((prev) => ({ ...prev, [name]: val }));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <h1 className="text-xl font-bold text-gray-800">Configuración del Local</h1>
        <p className="text-xs text-gray-500">Ajusta los parámetros operativos y fiscales de tu restaurante.</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
        {/* Datos Generales */}
        <div>
          <h2 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2 mb-4">
            Datos Comerciales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Nombre del Local</label>
              <input
                type="text"
                name="restaurantName"
                value={settings.restaurantName}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Símbolo de Moneda</label>
              <input
                type="text"
                name="currency"
                value={settings.currency}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Impuestos y Propinas */}
        <div>
          <h2 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2 mb-4">
            Impuestos & Propinas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Tasa de Impuesto / IGV (%)</label>
              <input
                type="number"
                name="taxRate"
                value={settings.taxRate}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Propina Sugerida (%)</label>
              <input
                type="number"
                name="suggestedTip"
                value={settings.suggestedTip}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Impresión de Comandas */}
        <div>
          <h2 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2 mb-4">
            Opciones de Impresión
          </h2>
          <div className="space-y-3 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="autoPrintKitchen"
                checked={settings.autoPrintKitchen}
                onChange={handleChange}
                className="rounded text-red-500 focus:ring-red-500"
              />
              <span className="font-semibold text-gray-700">Imprimir comanda de cocina automáticamente al enviar pedido</span>
            </label>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Mensaje en la Comanda / Ticket</label>
              <textarea
                name="receiptHeader"
                rows={2}
                value={settings.receiptHeader}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Guardar */}
        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button className="bg-red-500 hover:bg-red-600 text-white font-bold px-5 py-2 rounded-lg text-xs transition-colors shadow-sm">
            Guardar Configuración
          </button>
        </div>
      </div>
    </div>
  );
};