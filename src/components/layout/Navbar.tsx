// src/components/layout/Navbar.tsx
import React from 'react';

export const Navbar: React.FC = () => {
  return (
    <header className="h-14 bg-[#212328] border-b border-gray-800 flex items-center justify-between px-6 text-white">
      {/* Left Title / Location */}
      <div className="flex items-center gap-4">
        <span className="font-bold text-sm tracking-wide flex items-center gap-2">
          <span className="text-red-500">toteat</span>
          <span className="text-gray-400 font-normal">|</span>
          <span>Toteat Restaurant Manager</span>
        </span>
        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
          1
        </span>
      </div>

      {/* Search / Top Actions */}
      <div className="flex items-center gap-4 text-xs">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar..."
            className="bg-[#18191c] border border-gray-700 rounded-md px-3 py-1 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-red-500 w-48"
          />
        </div>

        {/* User Badge */}
        <div className="flex items-center gap-2 border-l border-gray-700 pl-4">
          <div className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center font-bold text-xs">
            M
          </div>
          <span className="font-medium text-xs text-gray-300">Marty Burger</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;