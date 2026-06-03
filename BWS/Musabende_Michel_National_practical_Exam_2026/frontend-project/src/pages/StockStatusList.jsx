import { useState, useEffect, useCallback } from 'react';
import { getStockStatuses, deleteStockStatus } from '../services/stockStatusService';
import { useDebounce } from '../hooks/useDebounce';
import { useToast } from '../components/Toast';
import DataTable from '../components/DataTable';
import ConfirmDialog from '../components/ConfirmDialog';
import { Package } from 'lucide-react';

export default function StockStatusList() {
  const { addToast } = useToast();
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const [confirm, setConfirm] = useState({ open: false, id: null });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getStockStatuses({ search: debouncedSearch });
      setStatuses(res.data || []);
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleDelete = async () => {
    try {
      await deleteStockStatus(confirm.id);
      addToast('Stock status deleted', 'success');
      setConfirm({ open: false, id: null });
      loadData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Delete failed', 'error');
    }
  };

  const columns = [
    {
      header: 'Product Name',
      accessor: 'product',
      render: (val) => (
        <div className="flex items-center space-x-2">
          <Package size={14} className="text-gray-400" />
          <span className="font-medium">{val?.productName || 'N/A'}</span>
        </div>
      ),
    },
    { header: 'Category', accessor: 'product', render: (val) => val?.category || 'N/A' },
    {
      header: 'Available Qty',
      accessor: 'availableQuantity',
      render: (val) => <span className="font-semibold text-blue-600">{val}</span>,
    },
    {
      header: 'Sold Qty',
      accessor: 'soldQuantity',
      render: (val) => <span className="font-semibold text-orange-600">{val}</span>,
    },
    {
      header: 'Remaining Qty',
      accessor: 'remainingQuantity',
      render: (val) => (
        <span className={`font-semibold ${val <= 5 ? 'text-red-600' : 'text-green-600'}`}>
          {val}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Stock Status</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor product stock availability</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          {
            label: 'Total Products', value: statuses.length,
            color: 'text-blue-600', bg: 'bg-blue-50',
          },
          {
            label: 'Low Stock (&le;5)',
            value: statuses.filter((s) => s.remainingQuantity <= 5).length,
            color: 'text-red-600', bg: 'bg-red-50',
          },
          {
            label: 'In Stock',
            value: statuses.filter((s) => s.remainingQuantity > 5).length,
            color: 'text-green-600', bg: 'bg-green-50',
          },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.bg} rounded-xl p-4`}>
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <DataTable
          columns={columns}
          data={statuses}
          loading={loading}
          onSearch={setSearch}
          onDelete={(row) => setConfirm({ open: true, id: row._id })}
        />
      </div>

      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Stock Status"
        message="Are you sure you want to delete this stock status record?"
      />
    </div>
  );
}
