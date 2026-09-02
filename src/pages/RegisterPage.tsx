// src/pages/RegisterPage.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useRestaurant } from '../context/RestaurantContext';
import axios from 'axios';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { settings } = useRestaurant();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'ADMIN',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await axios.post('http://localhost:8080/api/auth/register', formData);
      alert('¡Cuenta creada con éxito! Inicia sesión con tus credenciales.');
      navigate('/login');
    } catch (err: any) {
      console.error('Error al registrar usuario:', err);
      setError(
        err.response?.data?.message ||
        err.response?.data ||
        'Error al crear la cuenta. Intente con otro correo.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0b0e] via-[#111319] to-[#251307] flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Destellos ambientales de luz naranja */}
      <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-orange-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-120px] right-[-80px] w-[500px] h-[400px] bg-amber-600/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Tarjeta Blanca */}
      <div className="bg-white text-gray-900 border border-gray-200/90 p-8 sm:p-10 rounded-3xl max-w-md w-full shadow-2xl space-y-6 relative z-10">
        
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-lg shadow-orange-500/25 border border-orange-400/30">
            {settings.logoInitial}
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Crear Cuenta</h2>
          <p className="text-xs text-gray-500 font-medium">Regístrate para administrar {settings.name}</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl text-center animate-in fade-in">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1 tracking-wider">
              Nombre Completo
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej. Paolo Flores"
              className="w-full bg-gray-50 border border-gray-300 text-gray-900 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1 tracking-wider">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="usuario@ejemplo.com"
              className="w-full bg-gray-50 border border-gray-300 text-gray-900 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1 tracking-wider">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              className="w-full bg-gray-50 border border-gray-300 text-gray-900 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-orange-500/25 transition-all cursor-pointer disabled:opacity-50 active:scale-98 mt-2"
          >
            {loading ? 'Creando cuenta...' : 'Completar Registro'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-gray-100 text-xs text-gray-500 font-medium">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-orange-600 font-bold hover:underline">
            Iniciar Sesión
          </Link>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;