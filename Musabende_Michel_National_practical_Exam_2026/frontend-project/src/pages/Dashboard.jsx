import { useState, useEffect } from 'react';
import reportService from '../services/reportService';
import { useAuth } from '../contexts/AuthContext';
import { Users, Package, Receipt, DollarSign } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await reportService.getDashboard();
        if (res.data.success) setStats(res.data.data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { label: 'Total Customers', value: stats?.totalCustomers || 0, icon: Users, color: 'text-primary-400' },
    { label: 'Total Products', value: stats?.totalProducts || 0, icon: Package, color: 'text-emerald-400' },
    { label: 'Total Sales', value: stats?.totalSales || 0, icon: Receipt, color: 'text-primary-400' },
    { label: 'Total Revenue', value: `FRW ${(stats?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'text-emerald-400' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-slate-700/50 rounded-xl p-5 border border-slate-600 animate-pulse h-28" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Welcome back, {user?.username}!</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-slate-800 rounded-xl p-5 border border-slate-600 hover:border-slate-500 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-400 text-sm font-medium">{card.label}</span>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <p className="text-2xl font-bold text-white">{card.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-xl border border-slate-600 p-5">
          <h3 className="text-white font-semibold mb-3">Recent Sales</h3>
          {stats?.recentSales?.length > 0 ? (
            <div className="space-y-2">
              {stats.recentSales.map((sale) => (
                <div key={sale._id} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
                  <div>
                    <p className="text-sm text-white">{sale.invoiceNumber}</p>
                    <p className="text-xs text-slate-400">
                      {sale.customer?.firstName} {sale.customer?.lastName}
                    </p>
                  </div>
                  <span className="text-sm text-emerald-400 font-medium">
                    FRW {sale.totalAmountPaid?.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-sm">No recent sales</p>
          )}
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-600 p-5">
          <h3 className="text-white font-semibold mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'New Customer', link: '/customers' },
              { label: 'New Product', link: '/products' },
              { label: 'New Sale', link: '/sales' },
              { label: 'View Reports', link: '/reports' },
            ].map((action) => (
              <a
                key={action.label}
                href={action.link}
                className="px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-slate-200 hover:text-white text-center transition-colors"
              >
                {action.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
