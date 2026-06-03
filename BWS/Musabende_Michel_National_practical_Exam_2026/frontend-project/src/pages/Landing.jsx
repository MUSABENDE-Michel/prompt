import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRight, ShoppingBag, BarChart3, Shield } from 'lucide-react';

export default function Landing() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 flex flex-col">
      <header className="px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 text-white">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="font-bold text-sm">BWS</span>
            </div>
            <span className="font-semibold">DAB Enterprise Ltd</span>
          </div>
          <div className="space-x-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm text-white/90 hover:text-white transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-sm bg-white text-blue-700 rounded-lg font-medium hover:bg-blue-50 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center">
        <div className="max-w-6xl mx-auto px-6 w-full">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Business Web Solution for{' '}
              <span className="text-blue-200">DAB Enterprise Ltd</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl">
              Manage your products, track sales, and monitor stock status in real-time.
              A complete business management system for electronic devices and accessories.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/login"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-white text-blue-700 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg"
              >
                <span>Get Started</span>
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center space-x-2 px-6 py-3 border border-white/30 text-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                Create Account
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            {[
              { icon: ShoppingBag, title: 'Product Management', desc: 'Add, edit and manage your electronic products inventory' },
              { icon: BarChart3, title: 'Sales Tracking', desc: 'Record sales and track revenue with detailed reports' },
              { icon: Shield, title: 'Stock Monitoring', desc: 'Real-time stock status with available and sold quantities' },
            ].map((feature) => (
              <div key={feature.title} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
                <feature.icon size={32} className="text-blue-200 mb-4" />
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-blue-100 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
