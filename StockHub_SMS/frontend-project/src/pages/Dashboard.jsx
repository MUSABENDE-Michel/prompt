import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getDashboard } from '../services/reportService';
import { Package, Warehouse, ArrowLeftRight, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getDashboard();
        setData(res.data.data);
      } catch {
        // handled by interceptor
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
              <div className="h-8 bg-gray-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Total Products', value: data?.totalProducts || 0, icon: Package, color: 'bg-blue-500', textColor: 'text-blue-600' },
    { label: 'Total Stock (Qty)', value: data?.totalStock || 0, icon: Warehouse, color: 'bg-blue-500', textColor: 'text-blue-600' },
    { label: 'Stock Value', value: `${(data?.totalValue || 0).toLocaleString()} Frw`, icon: DollarSign, color: 'bg-blue-500', textColor: 'text-blue-600' },
    { label: 'Recent Activity', value: `${data?.recentTransactions?.length || 0} actions`, icon: ArrowLeftRight, color: 'bg-blue-500', textColor: 'text-blue-600' },
  ];

  return (
    <div className="space-y-6">
      {/* <div>
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-gray-500 text-sm">Welcome back, <strong>{user?.username}</strong>! Here's your overview.</p>
      </div> */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="text-white" size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/products" className="p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
              <Package className="text-blue-600 mb-2" size={24} />
              <p className="text-sm font-medium text-blue-700">Manage Products</p>
            </Link>
            <Link to="/warehouses" className="p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
              <Warehouse className="text-blue-600 mb-2" size={24} />
              <p className="text-sm font-medium text-blue-700">Manage Warehouses</p>
            </Link>
            <Link to="/transactions" className="p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
              <ArrowLeftRight className="text-blue-600 mb-2" size={24} />
              <p className="text-sm font-medium text-blue-700">New Transaction</p>
            </Link>
            <Link to="/reports" className="p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
              <TrendingUp className="text-blue-600 mb-2" size={24} />
              <p className="text-sm font-medium text-blue-700">View Reports</p>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
          {data?.recentTransactions?.length > 0 ? (
            <div className="space-y-3">
              {data.recentTransactions.map((t) => (
                <div key={t._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  {t.transactionType === 'STOCK_IN' ? (
                    <TrendingUp size={18} className="text-blue-600" />
                  ) : (
                    <TrendingDown size={18} className="text-gray-600" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {t.transactionType === 'STOCK_IN' ? 'Stock In' : 'Stock Out'} — {t.product?.productName || 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-500">{t.quantityMoved} units — {t.warehouse?.warehouseName || 'Unknown'}</p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(t.transactionDate).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No recent transactions.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
