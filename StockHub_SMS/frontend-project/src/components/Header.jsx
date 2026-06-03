import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Package, Menu } from 'lucide-react';

const Header = ({ onToggleSidebar }) => {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center px-4 lg:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>
        <Package className="text-blue-600" size={26} />
        <h1 className="text-xl font-bold text-gray-800 hidden sm:block">StockHub SMS</h1>
      </div>
      <div className="flex-1" />
      {user && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
            {user.username?.charAt(0).toUpperCase()}
          </div>
          <span className="hidden sm:inline">Welcome back, <strong>{user.username}</strong>!</span>
        </div>
      )}
    </header>
  );
};

export default Header;
