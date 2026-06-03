import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Package,
  Warehouse,
  ArrowLeftRight,
  FileText,
  Receipt,
  LogOut,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/products', icon: Package, label: 'Products' },
  { to: '/warehouses', icon: Warehouse, label: 'Warehouses' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  // { to: '/bills', icon: Receipt, label: 'Bills / Invoices' },
  { to: '/reports', icon: FileText, label: 'Reports' },
];

const Sidebar = ({ open, onClose, collapsed, onToggleCollapse }) => {
  const { logout } = useAuth();

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    } ${collapsed ? 'justify-center' : ''}`;

  const iconClass = 'min-w-5';

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-gray-900 text-white flex flex-col transition-all duration-200 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 ${collapsed ? 'w-16' : 'w-64'}`}
      >
        <div className="flex items-center h-16 border-b border-gray-700 px-3">
          {collapsed ? (
            <Package size={26} className="text-blue-400 mx-auto" />
          ) : (
            <div className="flex items-center gap-2 flex-1">
              <Package size={24} className="text-blue-400" />
              <span className="text-lg font-bold">StockHub SMS</span>
            </div>
          )}
          <button onClick={onClose} className="lg:hidden p-1 hover:bg-gray-700 rounded ml-auto">
            <X size={20} />
          </button>
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 hover:bg-gray-700 rounded ml-1 text-gray-400 hover:text-white transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={linkClass}
              onClick={onClose}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={20} className={iconClass} />
              {!collapsed && item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-gray-700 p-2">
          <button
            onClick={logout}
            className={`flex items-center gap-3 px-3 py-3 w-full rounded-lg text-sm font-medium text-gray-300 hover:bg-blue-700 hover:text-white transition-colors ${collapsed ? 'justify-center' : ''}`}
            title="Logout"
          >
            <LogOut size={20} className={iconClass} />
            {!collapsed && 'Logout'}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
