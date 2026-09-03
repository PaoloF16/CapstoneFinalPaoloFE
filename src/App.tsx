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
        <div className="flex h-screen bg-[#0d0f14] overflow-hidden select-none">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#0d0f14]">
            <Navbar />
            <main className="flex-1 overflow-y-auto bg-[#0d0f14]">
              <AppRouter />
            </main>
          </div>
        </div>
      ) : (
        <main className="min-h-screen bg-[#0d0f14]">
          <AppRouter />
        </main>
      )}
    </>
  );
};

export default App;