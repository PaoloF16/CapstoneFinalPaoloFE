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
    <div className="min-h-screen bg-[#0d0f12] flex items-center justify-center p-4">
      <div className="bg-[#181b22] border border-gray-800 p-8 rounded-3xl max-w-md w-full shadow-2xl space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-red-600 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-lg shadow-red-600/30">
            {settings.logoInitial}
          </div>
          <h2 className="text-2xl font-black text-white">Crear Cuenta</h2>
          <p className="text-xs text-gray-400">Regístrate para administrar {settings.name}</p>
        </div>

        {error && (
          <div className="p-3 bg-red-950/50 border border-red-800 text-red-400 text-xs font-bold rounded-xl text-center">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
              Nombre Completo
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej. Paolo Flores"
              className="w-full bg-[#101216] border border-gray-700 text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="usuario@ejemplo.com"
              className="w-full bg-[#101216] border border-gray-700 text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              className="w-full bg-[#101216] border border-gray-700 text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-red-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-red-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Creando cuenta...' : 'Completar Registro'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-gray-800 text-xs text-gray-400">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-red-400 font-bold hover:underline">
            Iniciar Sesión
          </Link>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;