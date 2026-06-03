import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getProducts } from '../services/productService';
import { getSales } from '../services/saleService';
import { getStockStatuses } from '../services/stockStatusService';
import { Package, ShoppingCart, BarChart3, DollarSign, ArrowUpRight, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ products: 0, sales: 0, stockItems: 0, revenue: 0 });
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [prodRes, saleRes, stockRes] = await Promise.all([
        getProducts(), getSales({}), getStockStatuses(),
      ]);
      const products = prodRes.data || [];
      const sales = saleRes.data || [];
      const stock = stockRes.data || [];

      setStats({
        products: products.length,
        sales: sales.length,
        stockItems: stock.length,
        revenue: sales.reduce((sum, s) => sum + (s.soldTotalPrice || 0), 0),
      });
      setRecentSales(sales.slice(0, 5));
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const statCards = [
    { label: 'Total Products', value: stats.products, icon: Package, color: 'bg-blue-500', link: '/products' },
    { label: 'Total Sales', value: stats.sales, icon: ShoppingCart, color: 'bg-green-500', link: '/sales' },
    { label: 'Stock Items', value: stats.stockItems, icon: BarChart3, color: 'bg-purple-500', link: '/stock-status' },
    { label: 'Revenue (RWF)', value: stats.revenue.toLocaleString(), icon: DollarSign, color: 'bg-orange-500', link: '/reports' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
              <div className="h-4 w-24 bg-gray-200 rounded mb-3" />
              <div className="h-8 w-16 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Welcome back, {user?.username}! Here's your business overview.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Link key={card.label} to={card.link}>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center`}>
                  <card.icon size={20} className="text-white" />
                </div>
                <ArrowUpRight size={16} className="text-gray-300" />
              </div>
              <p className="text-sm text-gray-500 mb-1">{card.label}</p>
              <p className="text-2xl font-bold text-gray-800">{card.value}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Recent Sales Activity</h2>
            <Link to="/sales" className="text-sm text-blue-600 hover:text-blue-700">View All</Link>
          </div>
          {recentSales.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No sales recorded yet</p>
          ) : (
            <div className="space-y-3">
              {recentSales.map((sale) => (
                <div key={sale._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <TrendingUp size={14} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        {sale.product?.productName || 'Product'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {sale.soldQuantity} units - {new Date(sale.salesDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-800">
                    {sale.soldTotalPrice?.toLocaleString()} RWF
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/products" className="block px-4 py-3 bg-blue-50 rounded-lg text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors">
              + Add New Product
            </Link>
            <Link to="/sales" className="block px-4 py-3 bg-green-50 rounded-lg text-sm font-medium text-green-700 hover:bg-green-100 transition-colors">
              + Record a Sale
            </Link>
            <Link to="/stock-status" className="block px-4 py-3 bg-purple-50 rounded-lg text-sm font-medium text-purple-700 hover:bg-purple-100 transition-colors">
              View Stock Status
            </Link>
            <Link to="/reports" className="block px-4 py-3 bg-orange-50 rounded-lg text-sm font-medium text-orange-700 hover:bg-orange-100 transition-colors">
              Generate Reports
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
