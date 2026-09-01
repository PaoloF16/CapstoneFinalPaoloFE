// src/App.tsx
import React from 'react';
import { AppRouter } from './routes/AppRouter';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar'; // 👈 Verificar esta ruta
import { useAuth } from './context/AuthContext';

export const App: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {isAuthenticated ? (
        <div className="flex h-screen bg-[#18191c] overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <Navbar />
            <main className="flex-1 overflow-y-auto bg-gray-100">
              <AppRouter />
            </main>
          </div>
        </div>
      ) : (
        <main className="min-h-screen bg-gray-100">
          <AppRouter />
        </main>
      )}
    </>
  );
};

export default App;