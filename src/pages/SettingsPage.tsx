// src/pages/SettingsPage.tsx
import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useRestaurant, type RestaurantSettings } from '../context/RestaurantContext';

export const SettingsPage: React.FC = () => {
  const { t, language, changeLanguage } = useLanguage();
  const { settings, updateSettings, resetSettings } = useRestaurant();

  const [formState, setFormState] = useState<RestaurantSettings>({ ...settings });
  const [activeTab, setActiveTab] = useState<'general' | 'financial' | 'ticket' | 'system'>('general');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const handleInputChange = (field: keyof RestaurantSettings, value: string | number) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formState);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleRestore = () => {
    if (confirm('¿Deseas restaurar la configuración a los valores por defecto?')) {
      resetSettings();
      setFormState({ ...settings });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{t('settings.title', 'Configuración del Restaurante')}</h1>
          <p className="text-sm text-gray-500">Personaliza la identidad de tu negocio, logo externo, moneda, precuenta e idioma del sistema.</p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleRestore}
            className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Restaurar Valores
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>💾</span>
            <span>Guardar Cambios</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-bold rounded-2xl animate-in fade-in">
          ✓ Configuración guardada y aplicada exitosamente a todo el sistema.
        </div>
      )}

      {/* PESTAÑAS */}
      <div className="flex gap-2 border-b border-gray-200 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'general' ? 'bg-red-600 text-white shadow-sm' : 'bg-white text-gray-600 border hover:bg-gray-50'
          }`}
        >
          🏪 Identidad y Marca
        </button>
        <button
          onClick={() => setActiveTab('financial')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'financial' ? 'bg-red-600 text-white shadow-sm' : 'bg-white text-gray-600 border hover:bg-gray-50'
          }`}
        >
          💰 Moneda e Impuestos
        </button>
        <button
          onClick={() => setActiveTab('ticket')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'ticket' ? 'bg-red-600 text-white shadow-sm' : 'bg-white text-gray-600 border hover:bg-gray-50'
          }`}
        >
          🧾 Precuenta y Tickets
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'system' ? 'bg-red-600 text-white shadow-sm' : 'bg-white text-gray-600 border hover:bg-gray-50'
          }`}
        >
          🌐 Idioma y Sistema
        </button>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* FORMULARIO */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
          <form onSubmit={handleSave} className="space-y-4">
            
            {/* PESTAÑA: IDENTIDAD Y MARCA */}
            {activeTab === 'general' && (
              <div className="space-y-4 animate-in fade-in">
                <h3 className="font-bold text-sm text-gray-800 uppercase tracking-wider border-b pb-2">
                  Datos de la Empresa y Logotipo
                </h3>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Nombre Comercial del Restaurante
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Ej. El Mesón Criollo"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Eslogan o Subtítulo
                  </label>
                  <input
                    type="text"
                    value={formState.slogan}
                    onChange={(e) => handleInputChange('slogan', e.target.value)}
                    placeholder="Ej. Sabores que conquistan"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>

                {/* LOGO: IMAGEN EXTERNA E INICIAL */}
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                  <span className="text-xs font-extrabold text-gray-700 uppercase tracking-wider block">
                    Logotipo del Restaurante
                  </span>

                  <div className="flex items-center gap-4">
                    {/* Preview del logo */}
                    <div className="w-14 h-14 rounded-2xl bg-white border-2 border-gray-300 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                      {formState.logoUrl ? (
                        <img
                          src={formState.logoUrl}
                          alt="Logo Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="font-black text-xl text-red-600">{formState.logoInitial || 'T'}</span>
                      )}
                    </div>

                    <div className="flex-1 space-y-2">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 uppercase mb-0.5">
                          URL de Imagen Externa (PNG, JPG, SVG)
                        </label>
                        <input
                          type="url"
                          value={formState.logoUrl || ''}
                          onChange={(e) => handleInputChange('logoUrl', e.target.value)}
                          placeholder="https://tu-servidor.com/logo.png"
                          className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-red-500 focus:outline-none bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase mb-0.5">
                      Inicial de Respaldo (Si no hay imagen o falla el enlace)
                    </label>
                    <input
                      type="text"
                      maxLength={2}
                      value={formState.logoInitial}
                      onChange={(e) => handleInputChange('logoInitial', e.target.value.toUpperCase())}
                      className="w-20 px-3 py-1.5 border border-gray-300 rounded-xl text-xs font-black text-center focus:ring-2 focus:ring-red-500 focus:outline-none bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      RUC / NIF / CIF (Identificador Fiscal)
                    </label>
                    <input
                      type="text"
                      value={formState.taxId}
                      onChange={(e) => handleInputChange('taxId', e.target.value)}
                      placeholder="Ej. 20609876541"
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Teléfono / WhatsApp
                    </label>
                    <input
                      type="text"
                      value={formState.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Ej. +51 987654321"
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      value={formState.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="admin@mirestaurante.com"
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Dirección del Local
                    </label>
                    <input
                      type="text"
                      value={formState.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Ej. Av. Larco 456, Lima"
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* PESTAÑA: MONEDA E IMPUESTOS */}
            {activeTab === 'financial' && (
              <div className="space-y-4 animate-in fade-in">
                <h3 className="font-bold text-sm text-gray-800 uppercase tracking-wider border-b pb-2">
                  Moneda y Configuración Fiscal
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Símbolo Moneda
                    </label>
                    <select
                      value={formState.currency}
                      onChange={(e) => handleInputChange('currency', e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm font-bold bg-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                    >
                      <option value="S/">S/ (Soles - Perú)</option>
                      <option value="$">$ (Dólares / Pesos)</option>
                      <option value="€">€ (Euros - Europa)</option>
                      <option value="CLP $">CLP $ (Chile)</option>
                      <option value="MXN $">MXN $ (México)</option>
                      <option value="COP $">COP $ (Colombia)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Impuesto / IGV / IVA (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={formState.taxRate}
                      onChange={(e) => handleInputChange('taxRate', Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Servicio Sugerido (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={formState.serviceFeeRate}
                      onChange={(e) => handleInputChange('serviceFeeRate', Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* PESTAÑA: PRECUENTA Y TICKETS */}
            {activeTab === 'ticket' && (
              <div className="space-y-4 animate-in fade-in">
                <h3 className="font-bold text-sm text-gray-800 uppercase tracking-wider border-b pb-2">
                  Personalización de Comprobante / Precuenta
                </h3>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Texto de Cabecera en Ticket
                  </label>
                  <input
                    type="text"
                    value={formState.ticketHeader}
                    onChange={(e) => handleInputChange('ticketHeader', e.target.value)}
                    placeholder="PRECUENTA DE CONSUMO"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Mensaje de Pie de Página
                  </label>
                  <textarea
                    rows={3}
                    value={formState.ticketFooter}
                    onChange={(e) => handleInputChange('ticketFooter', e.target.value)}
                    placeholder="¡Gracias por su visita! Síganos en @mirestaurante"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* PESTAÑA: IDIOMA Y SISTEMA */}
            {activeTab === 'system' && (
              <div className="space-y-4 animate-in fade-in">
                <h3 className="font-bold text-sm text-gray-800 uppercase tracking-wider border-b pb-2">
                  Idioma y Preferencias de Interfaz
                </h3>

                <div className="max-w-xs">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                    {t('settings.selectLanguage', 'Selecciona un idioma')}
                  </label>
                  <select
                    value={language}
                    onChange={(e) => changeLanguage(e.target.value as 'es' | 'en' | 'it')}
                    className="w-full p-3 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-red-500 outline-none cursor-pointer bg-white"
                  >
                    <option value="es">🇪🇸 {t('settings.spanish', 'Español')}</option>
                    <option value="en">🇬🇧 {t('settings.english', 'Inglés')}</option>
                    <option value="it">🇮🇹 {t('settings.italian', 'Italiano')}</option>
                  </select>
                </div>
              </div>
            )}

            <div className="pt-4 border-t flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md cursor-pointer transition-transform active:scale-95"
              >
                Guardar Configuración
              </button>
            </div>
          </form>
        </div>

        {/* COLUMNA DERECHA: LIVE PREVIEW DEL TICKET */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span>👁️</span> Vista Previa del Ticket
            </h3>

            {/* Simulación Ticket Térmico */}
            <div className="bg-amber-50/40 p-5 rounded-xl border border-dashed border-gray-300 font-mono text-xs text-gray-800 space-y-3 shadow-inner">
              <div className="text-center space-y-1 border-b border-gray-300 pb-3">
                
                {/* Logo en Ticket si existe */}
                {formState.logoUrl && (
                  <img
                    src={formState.logoUrl}
                    alt="Logo Ticket"
                    className="w-12 h-12 rounded-full mx-auto object-cover border border-gray-300 mb-1"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                )}

                <p className="font-black text-sm uppercase text-gray-900">{formState.name || 'NOMBRE RESTAURANTE'}</p>
                {formState.slogan && <p className="text-[10px] text-gray-500 italic">{formState.slogan}</p>}
                <p className="text-[10px] text-gray-600">RUC/NIF: {formState.taxId || '-'}</p>
                <p className="text-[10px] text-gray-600">{formState.address || '-'}</p>
                <p className="text-[10px] text-gray-600">Tel: {formState.phone || '-'}</p>
                <p className="text-[9px] text-red-600 font-bold uppercase mt-1">{formState.ticketHeader}</p>
              </div>

              <div className="flex justify-between text-[11px] font-bold border-b border-gray-200 pb-1">
                <span>Mesa #04</span>
                <span>Mozo: Paolo</span>
              </div>

              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>2x Lomo Saltado</span>
                  <span>{formState.currency} 50.00</span>
                </div>
                <div className="flex justify-between">
                  <span>1x Bebida Personal</span>
                  <span>{formState.currency} 8.00</span>
                </div>
              </div>

              <div className="border-t border-gray-300 pt-2 space-y-1 text-[11px]">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>{formState.currency} 49.15</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>IGV/IVA ({formState.taxRate}%):</span>
                  <span>{formState.currency} 8.85</span>
                </div>
                <div className="flex justify-between font-black text-sm text-gray-900 border-t border-gray-300 pt-1">
                  <span>TOTAL:</span>
                  <span>{formState.currency} 58.00</span>
                </div>
              </div>

              <div className="text-center text-[10px] text-gray-500 border-t border-gray-300 pt-3">
                <p>{formState.ticketFooter}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-xl text-center">
            <span className="text-xs text-gray-500 font-bold">
              Moneda configurada: <span className="text-red-600 font-black">{formState.currency}</span>
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};