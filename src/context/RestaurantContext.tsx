// src/context/RestaurantContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface RestaurantSettings {
  name: string;
  slogan: string;
  logoInitial: string;
  logoUrl?: string; // 👈 NUEVO: URL de imagen externa
  brandColor: string;
  phone: string;
  email: string;
  address: string;
  taxId: string;
  currency: string;
  taxRate: number;
  serviceFeeRate: number;
  ticketHeader: string;
  ticketFooter: string;
}

const DEFAULT_SETTINGS: RestaurantSettings = {
  name: 'Toteat Bistro & Grill',
  slogan: 'Gestión Gastronómica de Alta Precisión',
  logoInitial: 'T',
  logoUrl: '', // Vacío por defecto
  brandColor: '#ef4444',
  phone: '+51 987 654 321',
  email: 'contacto@toteat.com',
  address: 'Av. Gastronomía 101, Centro',
  taxId: '20601234567',
  currency: 'S/',
  taxRate: 18,
  serviceFeeRate: 10,
  ticketHeader: 'DOCUMENTO NO VÁLIDO COMO FACTURA FISCAL',
  ticketFooter: '¡Gracias por su visita! Esperamos verle pronto.',
};

interface RestaurantContextType {
  settings: RestaurantSettings;
  updateSettings: (newSettings: Partial<RestaurantSettings>) => void;
  resetSettings: () => void;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export const RestaurantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<RestaurantSettings>(() => {
    const saved = localStorage.getItem('restaurant_settings');
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem('restaurant_settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<RestaurantSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <RestaurantContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant debe usarse dentro de un RestaurantProvider');
  }
  return context;
};