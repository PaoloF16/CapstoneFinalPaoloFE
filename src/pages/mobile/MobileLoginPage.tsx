// src/pages/mobile/MobileLoginPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import type { User } from '../../types/user';

export const MobileLoginPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadStaff = async () => {
      try {
        const data = await userService.getUsers();
        // Filtrar usuarios activos
        setUsers(data.filter((u) => u.active));
      } catch (err) {
        console.error('Error al cargar personal:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStaff();
  }, []);

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setError('');
      if (newPin.length === 4 && selectedUser) {
        verifyPin(newPin, selectedUser);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError('');
  };

  const verifyPin = (inputPin: string, user: User) => {
    if (user.posPin === inputPin || (!user.posPin && inputPin === '1234')) {
      localStorage.setItem('pos_user', JSON.stringify(user));
      navigate('/mobile/tables');
    } else {
      setError('PIN Incorrecto');
      setPin('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col justify-between p-5 select-none font-sans">
      {/* Header */}
      <div className="text-center pt-4">
        <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center font-black text-2xl mx-auto shadow-lg shadow-red-600/30">
          t
        </div>
        <h1 className="text-xl font-bold mt-3">Comandera Móvil</h1>
        <p className="text-xs text-gray-400">Terminal Rápida para Meseros</p>
      </div>

      {/* Contenido Principal */}
      {!selectedUser ? (
        <div className="my-auto space-y-3">
          <p className="text-xs uppercase font-bold text-gray-400 tracking-wider text-center">
            Selecciona tu perfil de mesero
          </p>
          {loading ? (
            <div className="text-center py-6 text-gray-500">Cargando personal...</div>
          ) : (
            <div className="grid grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1">
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => {
                    setSelectedUser(user);
                    setPin('');
                    setError('');
                  }}
                  className="bg-gray-900 border border-gray-800 active:scale-95 hover:border-red-500/50 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <div className="w-12 h-12 rounded-full bg-gray-800 border border-gray-700 text-red-400 flex items-center justify-center font-black text-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-bold text-sm text-gray-200 text-center truncate w-full">
                    {user.name}
                  </span>
                  <span className="text-[10px] bg-red-950/60 text-red-400 font-bold px-2 py-0.5 rounded-md uppercase">
                    {user.role?.name || 'Personal'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="my-auto max-w-xs mx-auto w-full space-y-4">
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-300">
              Hola, <span className="text-red-400 font-bold">{selectedUser.name}</span>
            </p>
            <p className="text-xs text-gray-500">Ingresa tu PIN de 4 dígitos</p>
          </div>

          {/* Display PIN */}
          <div className="flex justify-center gap-3 my-2">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full border-2 transition-all ${
                  pin.length > idx
                    ? 'bg-red-500 border-red-500 scale-110 shadow-md shadow-red-500/50'
                    : 'border-gray-700 bg-gray-900'
                }`}
              />
            ))}
          </div>

          {error && (
            <p className="text-center text-xs font-bold text-red-500 animate-bounce">
              ⚠️ {error}
            </p>
          )}

          {/* Teclado Numérico Touch */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <button
                key={num}
                onClick={() => handleKeyPress(num)}
                className="h-16 bg-gray-900 active:bg-gray-800 text-xl font-black rounded-2xl border border-gray-800 shadow-sm flex items-center justify-center cursor-pointer transition-transform active:scale-95"
              >
                {num}
              </button>
            ))}
            <button
              onClick={() => {
                setSelectedUser(null);
                setPin('');
              }}
              className="h-16 bg-gray-900/50 text-xs font-bold text-gray-400 rounded-2xl border border-gray-800/80 active:scale-95"
            >
              Cambiar
            </button>
            <button
              onClick={() => handleKeyPress('0')}
              className="h-16 bg-gray-900 active:bg-gray-800 text-xl font-black rounded-2xl border border-gray-800 cursor-pointer active:scale-95"
            >
              0
            </button>
            <button
              onClick={handleDelete}
              className="h-16 bg-gray-900 text-lg rounded-2xl border border-gray-800 text-red-400 font-bold active:scale-95 flex items-center justify-center"
            >
              ⌫
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-[10px] text-gray-600 pb-2">
        Toteat POS Mobile Engine v2.0
      </div>
    </div>
  );
};