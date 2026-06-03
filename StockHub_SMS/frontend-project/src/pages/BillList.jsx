import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Search, Eye, Trash2, Receipt } from 'lucide-react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import useDebounce from '../hooks/useDebounce';
import * as billService from '../services/billService';
import * as transactionService from '../services/transactionService';

const BillList = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({ transactionId: '', customerName: '', customerContact: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const debouncedSearch = useDebounce(search);

  const fetchBills = useCallback(async () => {
    setLoading(true);
    try {
      const res = await billService.getBills({ page, limit: 10, search: debouncedSearch });
      setBills(res.data.data);
      setTotalPages(res.data.pagination?.pages || 1);
    } catch {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => { fetchBills(); }, [fetchBills]);

  const openCreate = async () => {
    try {
      const res = await transactionService.getTransactions({ limit: 100 });
      const stockOut = res.data.data.filter((t) => t.transactionType === 'STOCK_OUT');
      setTransactions(stockOut);
      setForm({ transactionId: '', customerName: '', customerContact: '', notes: '' });
      setModalOpen(true);
    } catch {
      toast.error('Failed to load transactions');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.transactionId) { toast.error('Select a transaction'); return; }
    if (!form.customerName.trim()) { toast.error('Enter customer name'); return; }
    setSubmitting(true);
    try {
      await billService.createBill(form);
      toast.success('Invoice created');
      setModalOpen(false);
      fetchBills();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create invoice');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (bill) => {
    setDeleteTarget(bill);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    try {
      await billService.deleteBill(deleteTarget._id);
      toast.success('Invoice deleted');
      setConfirmOpen(false);
      setDeleteTarget(null);
      fetchBills();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const statusBadge = (status) => {
    const colors = {
      paid: 'bg-blue-100 text-blue-700',
      unpaid: 'bg-gray-100 text-gray-700',
      cancelled: 'bg-gray-100 text-gray-700',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status] || 'bg-gray-100 text-gray-600'}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown'}
      </span>
    );
  };

  const columns = [
    { key: 'billNumber', label: 'Invoice #', render: (v) => <span className="font-mono font-medium text-blue-600">{v}</span> },
    { key: 'customerName', label: 'Customer' },
    { key: 'totalAmount', label: 'Amount', render: (v) => `${Number(v || 0).toLocaleString()} Frw` },
    {
      key: 'status', label: 'Status', render: (v) => statusBadge(v),
    },
    {
      key: 'createdAt', label: 'Date', render: (v) => v ? new Date(v).toLocaleDateString() : '-',
    },
    {
      key: '_id', label: 'Actions', render: (_v, row) => (
        <div className="flex items-center gap-2">
          <Link to={`/bills/${row._id}`}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="View Invoice">
            <Eye size={16} />
          </Link>
          <button onClick={() => confirmDelete(row)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Delete">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Bills / Invoices</h2>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
          <Plus size={18} /> New Invoice
        </button>
      </div>

      <div className="relative max-w-xs">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search invoices..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <DataTable columns={columns} data={bills} loading={loading}
          page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title="New Invoice" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock-Out Transaction *</label>
            <select value={form.transactionId}
              onChange={(e) => {
                const t = transactions.find((tx) => tx._id === e.target.value);
                setForm({ ...form, transactionId: e.target.value });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" required>
              <option value="">Select a stock-out transaction</option>
              {transactions.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.product?.productName || '-'} - {t.quantityMoved} pcs ({new Date(t.transactionDate).toLocaleDateString()})
                </option>
              ))}
              {transactions.length === 0 && <option disabled>No stock-out transactions available</option>}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
            <input type="text" value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Contact</label>
            <input type="text" value={form.customerContact}
              onChange={(e) => setForm({ ...form, customerContact: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancel</button>
            <button type="submit" disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50">
              {submitting ? 'Creating...' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={confirmOpen} onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Invoice"
        message="Are you sure you want to delete this invoice?" />
    </div>
  );
};

export default BillList;
