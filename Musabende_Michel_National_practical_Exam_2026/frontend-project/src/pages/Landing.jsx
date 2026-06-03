import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingCart, BarChart3, Shield, Users, Package } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <header className="px-6 py-4 border-b border-slate-700">
        <h1 className="text-xl font-bold text-white">SalesPro Ltd - SRMS</h1>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-3xl text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary-600/20 flex items-center justify-center">
            <ShoppingCart className="w-8 h-8 text-primary-400" />
          </div>

          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
            Sales Record Management System
          </h2>
          <p className="text-lg text-slate-300 mb-8 max-w-xl mx-auto leading-relaxed">
            Streamline your sales recording process. Manage customers, products, and sales
            digitally with automated report generation.
          </p>

          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors text-lg"
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl w-full">
          {[
            { icon: Users, label: 'Customer Management', desc: 'Track customer details and history' },
            { icon: Package, label: 'Product Inventory', desc: 'Manage product catalog and pricing' },
            { icon: BarChart3, label: 'Sales Reports', desc: 'Generate daily, weekly, monthly reports' },
          ].map((item) => (
            <div key={item.label} className="bg-slate-800 border border-slate-700 rounded-xl p-5 text-center">
              <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-primary-600/20 flex items-center justify-center">
                <item.icon className="w-5 h-5 text-primary-400" />
              </div>
              <h3 className="text-white font-semibold mb-1">{item.label}</h3>
              <p className="text-slate-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="px-6 py-4 border-t border-slate-700 text-center text-slate-500 text-sm">
        SalesPro Ltd &copy; {new Date().getFullYear()} &mdash; Huye District, Southern Province, Rwanda
      </footer>
    </div>
  );
}
