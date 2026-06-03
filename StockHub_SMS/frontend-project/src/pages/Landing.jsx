import React from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowRight, Shield, BarChart3, Warehouse } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Package size={28} />
            <span className="text-xl font-bold">StockHub SMS</span>
          </div>
          <div className="flex gap-3">
            <Link
              to="/login"
              className="px-5 py-2 text-sm font-medium text-white border border-white/30 rounded-lg hover:bg-white/10 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-5 py-2 text-sm font-medium text-blue-700 bg-white rounded-lg hover:bg-gray-100 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </nav>

        <main className="mt-20 lg:mt-32 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
            Stock Management<br />
            <span className="text-blue-200">Made Simple</span>
          </h1>
          <p className="mt-6 text-lg text-blue-100 max-w-2xl mx-auto">
            StockHub Ltd's web-based Stock Management System. Track inventory, manage warehouses,
            record stock movements, and generate reports — all in one place.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 mt-8 px-8 py-4 bg-white text-blue-700 font-semibold rounded-xl shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all text-lg"
          >
            Get Started <ArrowRight size={20} />
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
              <Package className="mx-auto mb-3" size={32} />
              <h3 className="font-semibold text-lg">Product Management</h3>
              <p className="text-blue-100 text-sm mt-2">Manage products with auto-generated codes and real-time stock tracking</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
              <Warehouse className="mx-auto mb-3" size={32} />
              <h3 className="font-semibold text-lg">Warehouse Tracking</h3>
              <p className="text-blue-100 text-sm mt-2">Track multiple warehouses and their locations across Rwanda</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
              <BarChart3 className="mx-auto mb-3" size={32} />
              <h3 className="font-semibold text-lg">Smart Reports</h3>
              <p className="text-blue-100 text-sm mt-2">Daily, weekly and monthly reports with CSV/Excel/PDF export</p>
            </div>
          </div>
        </main>

        <footer className="mt-20 text-center text-blue-200 text-sm pb-8">
          &copy; {new Date().getFullYear()} StockHub Ltd, Kigali City, Rwanda. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default Landing;
