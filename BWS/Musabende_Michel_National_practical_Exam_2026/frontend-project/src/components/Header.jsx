import { User, Menu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Header({ onToggleSidebar }) {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm h-16 flex items-center px-4 lg:px-6 sticky top-0 z-30">
      <button
        onClick={onToggleSidebar}
        className="lg:hidden mr-3 p-2 rounded-md hover:bg-gray-100 text-gray-600"
      >
        <Menu size={22} />
      </button>

      <div className="flex items-center space-x-3 flex-1">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">BWS</span>
        </div>
        <h1 className="text-lg font-semibold text-gray-800 hidden sm:block">
          DAB Enterprise Ltd - Business Web Solution
        </h1>
        <h1 className="text-lg font-semibold text-gray-800 sm:hidden">BWS</h1>
      </div>

      {user && (
        <div className="flex items-center space-x-2 text-gray-700">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <User size={16} className="text-blue-600" />
          </div>
          <span className="text-sm font-medium hidden sm:block">
            Welcome back, {user.username}!
          </span>
        </div>
      )}
    </header>
  );
}
