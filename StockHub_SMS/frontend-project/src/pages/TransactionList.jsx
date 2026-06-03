import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Search, Receipt } from 'lucide-react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import useDebounce from '../hooks/useDebounce';
import * as transactionService from '../services/transactionService';
import * as productService from '../services/productService';
import * as warehouseService from '../services/warehouseService';
import * as billService from '../services/billService';

const initialForm = {
  transactionDate: new Date().toISOString().split('T')[0],
  quantityMoved: 1,
  transactionType: 'STOCK_IN',
  product: '',
  warehouse: '',
};

const TransactionList = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [invoiceTransaction, setInvoiceTransaction] = useState(null);
  const [invoiceForm, setInvoiceForm] = useState({ customerName: '', customerContact: '', notes: '' });
  const [submittingInvoice, setSubmittingInvoice] = useState(false);
  const debouncedSearch = useDebounce(search);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await transactionService.getTransactions({ page, limit: 10, search: debouncedSearch });
      setTransactions(res.data.data);
      setTotalPages(res.data.pagination?.pages || 1);
    } catch {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  const fetchOptions = async () => {
    try {
      const [pRes, wRes] = await Promise.all([
        productService.getProducts({ limit: 100 }),
        warehouseService.getWarehouses({ limit: 100 }),
      ]);
      setProducts(pRes.data.data);
      setWarehouses(wRes.data.data);
    } catch {
      toast.error('Failed to load options');
    }
  };

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    fetchOptions();
    setModalOpen(true);
  };

  const openEdit = async (transaction) => {
    setEditing(transaction);
    await fetchOptions();
    setForm({
      transactionDate: transaction.transactionDate?.split('T')[0] || '',
      quantityMoved: transaction.quantityMoved,
      transactionType: transaction.transactionType,
      product: transaction.product?._id || '',
      warehouse: transaction.warehouse?._id || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.transactionDate) { toast.error('Transaction date is required'); return; }
    if (!form.transactionType) { toast.error('Transaction type is required'); return; }
    if (!form.product) { toast.error('Select a product'); return; }
    if (!form.warehouse) { toast.error('Select a warehouse'); return; }
    if (form.quantityMoved < 1) { toast.error('Quantity must be at least 1'); return; }
    setSubmitting(true);
    try {
      if (editing) {
        await transactionService.updateTransaction(editing._id, form);
        toast.success('Transaction updated');
      } else {
        await transactionService.createTransaction(form);
        toast.success('Transaction created');
      }
      setModalOpen(false);
      fetchTransactions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (transaction) => {
    setDeleteTarget(transaction);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    try {
      await transactionService.deleteTransaction(deleteTarget._id);
      toast.success('Transaction deleted');
      setConfirmOpen(false);
      setDeleteTarget(null);
      fetchTransactions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const openInvoiceModal = (transaction) => {
    setInvoiceTransaction(transaction);
    setInvoiceForm({ customerName: '', customerContact: '', notes: '' });
    setInvoiceModalOpen(true);
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    if (!invoiceForm.customerName.trim()) { toast.error('Enter customer name'); return; }
    setSubmittingInvoice(true);
    try {
      const res = await billService.createBill({
        transactionId: invoiceTransaction._id,
        ...invoiceForm,
      });
      const billId = res.data.data._id;
      const billNumber = res.data.data.billNumber;
      toast.success(`Invoice ${billNumber} created`);
      setInvoiceModalOpen(false);
      setInvoiceTransaction(null);
      navigate(`/bills/${billId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create invoice');
    } finally {
      setSubmittingInvoice(false);
    }
  };

  const columns = [
    {
      key: 'transactionDate', label: 'Date',
      render: (v) => v ? new Date(v).toLocaleDateString() : '-',
    },
    { key: 'quantityMoved', label: 'Qty' },
    {
      key: 'transactionType', label: 'Type',
      render: (v) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          v === 'STOCK_IN' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
        }`}>
          {v === 'STOCK_IN' ? 'Stock In' : 'Stock Out'}
        </span>
      ),
    },
    { key: 'product', label: 'Product', render: (v) => v?.productName || '-' },
    { key: 'warehouse', label: 'Warehouse', render: (v) => v?.warehouseName || '-' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Stock Transactions</h2>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
          <Plus size={18} /> New Transaction
        </button>
      </div>

      <div className="relative max-w-xs">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search transactions..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <DataTable columns={columns} data={transactions} loading={loading}
          onEdit={openEdit} onDelete={confirmDelete}
          page={page} totalPages={totalPages} onPageChange={setPage}
          extraActions={(row) => row.transactionType === 'STOCK_OUT' && (
            <button onClick={() => openInvoiceModal(row)}
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Generate Invoice">
              <Receipt size={16} />
            </button>
          )} />
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Transaction' : 'New Transaction'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Date *</label>
              <input type="date" value={form.transactionDate}
                onChange={(e) => setForm({ ...form, transactionDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type *</label>
              <select value={form.transactionType}
                onChange={(e) => setForm({ ...form, transactionType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" required>
                <option value="STOCK_IN">Stock In</option>
                <option value="STOCK_OUT">Stock Out</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product *</label>
              <select value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" required>
                <option value="">Select product</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>{p.productName} ({p.productCode})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse *</label>
              <select value={form.warehouse} onChange={(e) => setForm({ ...form, warehouse: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" required>
                <option value="">Select warehouse</option>
                {warehouses.map((w) => (
                  <option key={w._id} value={w._id}>{w.warehouseName} ({w.warehouseCode})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Moved *</label>
              <input type="number" min="1" value={form.quantityMoved}
                onChange={(e) => setForm({ ...form, quantityMoved: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" required />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancel</button>
            <button type="submit" disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50">
              {submitting ? 'Saving...' : editing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={confirmOpen} onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This will adjust stock quantities." />

      <Modal isOpen={invoiceModalOpen} onClose={() => setInvoiceModalOpen(false)}
        title="Generate Invoice" size="md">
        <form onSubmit={handleCreateInvoice} className="space-y-4">
          {invoiceTransaction && (
            <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
              <p><strong>Product:</strong> {invoiceTransaction.product?.productName || '-'}</p>
              <p><strong>Quantity:</strong> {invoiceTransaction.quantityMoved}</p>
              <p><strong>Date:</strong> {new Date(invoiceTransaction.transactionDate).toLocaleDateString()}</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
            <input type="text" value={invoiceForm.customerName}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, customerName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Contact</label>
            <input type="text" value={invoiceForm.customerContact}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, customerContact: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={invoiceForm.notes}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setInvoiceModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancel</button>
            <button type="submit" disabled={submittingInvoice}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50">
              {submittingInvoice ? 'Creating...' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TransactionList;
