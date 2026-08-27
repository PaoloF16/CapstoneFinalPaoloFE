// src/components/layout/Navbar.tsx
import React from 'react';
import { useLanguage, type Language } from '../../context/LanguageContext';
import { useRestaurant } from '../../context/RestaurantContext';

export const Navbar: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const { settings } = useRestaurant();

  const currentLang = String(language).toUpperCase();

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'ES', label: 'ES', flag: '🇪🇸' },
    { code: 'EN', label: 'EN', flag: '🇬🇧' },
    { code: 'IT', label: 'IT', flag: '🇮🇹' },
  ];

  return (
    <header className="h-14 bg-[#212328] border-b border-gray-800 flex items-center justify-between px-6 text-white w-full shrink-0 select-none">
      {/* Información del Restaurante */}
      <div className="flex items-center gap-4">
        <span className="font-bold text-sm tracking-wide flex items-center gap-2">
          <span className="text-red-500 font-black tracking-tight">{settings.name}</span>
          <span className="text-gray-600 font-normal">|</span>
          <span className="text-xs text-gray-400 font-medium hidden sm:inline">{settings.slogan}</span>
        </span>
      </div>

      {/* Herramientas de la Barra Superior */}
      <div className="flex items-center gap-4 text-xs">
        {/* Buscador Global */}
        <div className="relative">
          <input
            type="text"
            placeholder={t('common.search', 'Buscar...')}
            className="bg-[#18191c] border border-gray-700 rounded-md px-3 py-1 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-red-500 w-40 sm:w-48"
          />
        </div>

        {/* Selector de Idiomas con Banderas */}
        <div className="flex items-center gap-1 bg-[#18191c] border border-gray-700 rounded-md p-1">
          {languages.map(({ code, label, flag }) => (
            <button
              key={code}
              type="button"
              onClick={() => setLanguage(code)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                currentLang === code
                  ? 'bg-red-500 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span>{flag}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Badge de Marca */}
        <div className="flex items-center gap-2 border-l border-gray-700 pl-4">
          <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center font-black text-xs text-white">
            {settings.logoInitial}
          </div>
          <span className="font-bold text-xs text-gray-200 truncate max-w-[120px]">
            {settings.name}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;