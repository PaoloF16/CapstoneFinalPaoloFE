// src/pages/SettingsPage.tsx
import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export const SettingsPage: React.FC = () => {
  const { t, language, changeLanguage } = useLanguage();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">{t('settings.title', 'Configuración del Sistema')}</h1>
        <p className="text-sm text-gray-500">{t('settings.subtitle', 'Personaliza las preferencias de la aplicación y el idioma.')}</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-gray-700">{t('settings.language', 'Idioma de la Aplicación')}</h2>
        
        <div className="max-w-xs">
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
            {t('settings.selectLanguage', 'Selecciona un idioma')}
          </label>
          <select
            value={language}
            onChange={(e) => changeLanguage(e.target.value as 'es' | 'en' | 'it')}
            className="w-full p-3 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
          >
            <option value="es">🇪🇸 {t('settings.spanish', 'Español')}</option>
            <option value="en">🇬🇧 {t('settings.english', 'Inglés')}</option>
            <option value="it">🇮🇹 {t('settings.italian', 'Italiano')}</option>
          </select>
        </div>
      </div>
    </div>
  );
};