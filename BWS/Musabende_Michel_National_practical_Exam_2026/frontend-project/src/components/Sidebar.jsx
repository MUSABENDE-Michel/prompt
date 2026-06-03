import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, BarChart3, FileText, LogOut, X, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/sales', label: 'Sales', icon: ShoppingCart },
  { to: '/stock-status', label: 'Stock Status', icon: BarChart3 },
  { to: '/reports', label: 'Reports', icon: FileText },
];

export default function Sidebar({ collapsed, onToggle, onClose }) {
  const { logout } = useAuth();

  return (
    <>
      {onClose && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`bg-gray-900 text-white flex flex-col transition-all duration-300 ease-in-out fixed lg:static inset-y-0 left-0 z-50
          ${collapsed ? 'w-16' : 'w-60'}
          ${onClose ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className={`flex items-center h-16 border-b border-gray-700 px-4 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <span className="font-bold text-base tracking-wide">BWS Menu</span>
          )}
          <div className="flex items-center space-x-1">
            <button onClick={onClose} className="lg:hidden p-1 hover:bg-gray-700 rounded">
              <X size={18} />
            </button>
            <button onClick={onToggle} className="hidden lg:block p-1 hover:bg-gray-700 rounded">
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>
        </div>

        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`
              }
              title={item.label}
            >
              <item.icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-gray-700 p-2">
          <button
            onClick={() => { logout(); if (onClose) onClose(); }}
            className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-900/30 transition-colors`}
            title="Logout"
          >
            <LogOut size={20} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
