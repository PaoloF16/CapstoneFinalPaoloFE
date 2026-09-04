import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useRestaurant, type RestaurantSettings } from '../context/RestaurantContext';
import {
  IdentityBrandIcon,
  CurrencyIcon,
  PreCheckReceiptsIcon,
  LanguageSystemIcon,
  SaveChangesIcon,
} from '../components/common/Icons';

export const SettingsPage: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
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

  const currentLang = String(language).toUpperCase();

  return (
    <div className="min-h-screen bg-[#0d0f14] p-6 max-w-7xl mx-auto space-y-6 select-none relative">
      {/* Glow ambiental naranja */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER (TARJETA BLANCA) */}
      <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white text-gray-900 p-6 rounded-3xl border border-gray-200/80 shadow-md gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            {t('settings.title', 'Configuración del Restaurante')}
          </h1>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            {t('settings.subtitle', 'Personaliza la identidad de tu negocio, logo externo, moneda, precuenta e idioma del sistema.')}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleRestore}
            className="px-4 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-2xl transition-colors cursor-pointer shadow-xs"
          >
            {t('settings.resetValues', 'Restaurar Valores')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold rounded-2xl shadow-md shadow-orange-500/20 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
          >
            <SaveChangesIcon className="w-4 h-4" />
            <span>{t('settings.saveChanges', 'Guardar Cambios')}</span>
          </button>
        </div>
      </div>

      {/* ALERTA DE GUARDADO EXITOSO */}
      {saveSuccess && (
        <div className="relative z-10 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl animate-in fade-in flex items-center gap-2 shadow-xs">
          <span>✓</span>
          <span>{t('settings.saveSuccess', 'Configuración guardada y aplicada exitosamente a todo el sistema.')}</span>
        </div>
      )}

      {/* PESTAÑAS DE NAVEGACIÓN */}
      <div className="relative z-10 flex gap-2 border-b border-gray-800/80 pb-3 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'general'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-xs'
          }`}
        >
          <IdentityBrandIcon className="w-4 h-4" />
          <span>{t('settings.tabIdentity', 'Identidad y Marca')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('financial')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'financial'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-xs'
          }`}
        >
          <CurrencyIcon className="w-4 h-4" />
          <span>{t('settings.tabCurrency', 'Moneda e Impuestos')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ticket')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'ticket'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-xs'
          }`}
        >
          <PreCheckReceiptsIcon className="w-4 h-4" />
          <span>{t('settings.tabTickets', 'Precuenta y Tickets')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('system')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'system'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-xs'
          }`}
        >
          <LanguageSystemIcon className="w-4 h-4" />
          <span>{t('settings.tabSystem', 'Idioma y Sistema')}</span>
        </button>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FORMULARIO (TARJETA BLANCA) */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-md space-y-6 text-gray-900">
          <form onSubmit={handleSave} className="space-y-5">
            {/* PESTAÑA: IDENTIDAD Y MARCA */}
            {activeTab === 'general' && (
              <div className="space-y-4 animate-in fade-in">
                <h3 className="font-black text-xs text-gray-800 uppercase tracking-wider border-b border-gray-100 pb-2.5">
                  {t('settings.sectionBusiness', 'DATOS DE LA EMPRESA Y LOGOTIPO')}
                </h3>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                    {t('settings.businessName', 'NOMBRE COMERCIAL DEL RESTAURANTE')}
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Ej. El Mesón Criollo"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-2xl text-xs font-semibold text-gray-900 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                    {t('settings.slogan', 'ESLOGAN O SUBTÍTULO')}
                  </label>
                  <input
                    type="text"
                    value={formState.slogan}
                    onChange={(e) => handleInputChange('slogan', e.target.value)}
                    placeholder="Ej. Sabores que conquistan"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-2xl text-xs font-medium text-gray-900 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 outline-none transition-all"
                  />
                </div>

                {/* LOGO: PREVIEW Y CAMPOS */}
                <div className="p-4 bg-[#f8f9fc] rounded-2xl border border-gray-200/80 space-y-3">
                  <span className="text-xs font-black text-gray-700 uppercase tracking-wider block">
                    {t('settings.logoTitle', 'Logotipo del Restaurante')}
                  </span>

                  <div className="flex items-center gap-4">
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
                        <span className="font-black text-xl text-orange-600">{formState.logoInitial || 'T'}</span>
                      )}
                    </div>

                    <div className="flex-1 space-y-2">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 uppercase mb-0.5">
                          {t('settings.logoUrl', 'URL DE IMAGEN EXTERNA (PNG, JPG, SVG)')}
                        </label>
                        <input
                          type="url"
                          value={formState.logoUrl || ''}
                          onChange={(e) => handleInputChange('logoUrl', e.target.value)}
                          placeholder="https://tu-servidor.com/logo.png"
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase mb-0.5">
                      {t('settings.logoFallback', 'INICIAL DE RESPALDO (SI NO HAY IMAGEN O FALLA EL ENLACE)')}
                    </label>
                    <input
                      type="text"
                      maxLength={2}
                      value={formState.logoInitial}
                      onChange={(e) => handleInputChange('logoInitial', e.target.value.toUpperCase())}
                      className="w-20 px-3 py-1.5 bg-white border border-gray-300 rounded-xl text-xs font-black text-center text-gray-900 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                      {t('settings.taxId', 'RUC / NIF / CIF (IDENTIFICADOR FISCAL)')}
                    </label>
                    <input
                      type="text"
                      value={formState.taxId}
                      onChange={(e) => handleInputChange('taxId', e.target.value)}
                      placeholder="Ej. 20609876541"
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-2xl text-xs font-mono font-semibold focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                      {t('settings.phone', 'TELÉFONO / WHATSAPP')}
                    </label>
                    <input
                      type="text"
                      value={formState.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Ej. +51 987654321"
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                      {t('settings.email', 'CORREO ELECTRÓNICO')}
                    </label>
                    <input
                      type="email"
                      value={formState.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="admin@mirestaurante.com"
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                      {t('settings.address', 'DIRECCIÓN DEL LOCAL')}
                    </label>
                    <input
                      type="text"
                      value={formState.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Ej. Av. Larco 456, Lima"
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* PESTAÑA: MONEDA E IMPUESTOS */}
            {activeTab === 'financial' && (
              <div className="space-y-4 animate-in fade-in">
                <h3 className="font-black text-xs text-gray-800 uppercase tracking-wider border-b border-gray-100 pb-2.5">
                  {t('settings.tabCurrency', 'Moneda y Configuración Fiscal')}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                      {t('settings.currencyConfigured', 'Símbolo Moneda')}
                    </label>
                    <select
                      value={formState.currency}
                      onChange={(e) => handleInputChange('currency', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-2xl text-xs font-bold text-gray-900 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 outline-none"
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
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                      Impuesto / IGV / IVA (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={formState.taxRate}
                      onChange={(e) => handleInputChange('taxRate', Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-2xl text-xs font-bold text-gray-900 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                      Servicio Sugerido (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={formState.serviceFeeRate}
                      onChange={(e) => handleInputChange('serviceFeeRate', Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-2xl text-xs font-bold text-gray-900 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* PESTAÑA: PRECUENTA Y TICKETS */}
            {activeTab === 'ticket' && (
              <div className="space-y-4 animate-in fade-in">
                <h3 className="font-black text-xs text-gray-800 uppercase tracking-wider border-b border-gray-100 pb-2.5">
                  {t('settings.tabTickets', 'Personalización de Comprobante / Precuenta')}
                </h3>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                    Texto de Cabecera en Ticket
                  </label>
                  <input
                    type="text"
                    value={formState.ticketHeader}
                    onChange={(e) => handleInputChange('ticketHeader', e.target.value)}
                    placeholder="PRECUENTA DE CONSUMO"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                    Mensaje de Pie de Página
                  </label>
                  <textarea
                    rows={3}
                    value={formState.ticketFooter}
                    onChange={(e) => handleInputChange('ticketFooter', e.target.value)}
                    placeholder="¡Gracias por su visita! Síganos en @mirestaurante"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 outline-none"
                  />
                </div>
              </div>
            )}

            {/* PESTAÑA: IDIOMA Y SISTEMA */}
            {activeTab === 'system' && (
              <div className="space-y-4 animate-in fade-in">
                <h3 className="font-black text-xs text-gray-800 uppercase tracking-wider border-b border-gray-100 pb-2.5">
                  {t('settings.tabSystem', 'Idioma y Preferencias de Interfaz')}
                </h3>

                <div className="max-w-xs">
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-2">
                    Selecciona un idioma
                  </label>
                  <select
                    value={currentLang}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-2xl text-xs font-bold text-gray-800 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 outline-none cursor-pointer"
                  >
                    <option value="ES">🇪🇸 Español</option>
                    <option value="EN">🇬🇧 English</option>
                    <option value="IT">🇮🇹 Italiano</option>
                  </select>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md shadow-orange-500/20 cursor-pointer transition-transform active:scale-95"
              >
                {t('settings.saveConfigBtn', 'GUARDAR CONFIGURACIÓN')}
              </button>
            </div>
          </form>
        </div>

        {/* COLUMNA DERECHA: LIVE PREVIEW DEL TICKET (TARJETA BLANCA) */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-md flex flex-col justify-between">
          <div>
            <h3 className="font-black text-xs text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span>👁️</span> {t('settings.ticketPreview', 'VISTA PREVIA DEL TICKET')}
            </h3>

            {/* Simulación Ticket Térmico en papel suave */}
            <div className="bg-[#fcfbf9] p-5 rounded-2xl border-2 border-dashed border-gray-300 font-mono text-xs text-gray-800 space-y-3 shadow-inner">
              <div className="text-center space-y-1 border-b border-gray-300 pb-3">
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
                <p className="text-[9px] text-orange-600 font-bold uppercase mt-1">{formState.ticketHeader}</p>
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

          <div className="mt-4 p-3 bg-gray-50 border border-gray-100 rounded-2xl text-center">
            <span className="text-xs text-gray-500 font-bold">
              {t('settings.currencyConfigured', 'Moneda configurada:')}{' '}
              <span className="text-orange-600 font-black">{formState.currency}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;