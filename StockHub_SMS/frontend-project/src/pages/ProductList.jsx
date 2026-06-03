import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Plus, Search } from 'lucide-react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import useDebounce from '../hooks/useDebounce';
import * as productService from '../services/productService';

const initialForm = {
  productName: '', category: '', quantityInStock: 0,
  unitPrice: 0, supplierName: '', dateReceived: new Date().toISOString().split('T')[0],
};

const ProductList = () => {
  const [products, setProducts] = useState([]);
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
  const debouncedSearch = useDebounce(search);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productService.getProducts({ page, limit: 10, search: debouncedSearch });
      setProducts(res.data.data);
      setTotalPages(res.data.pagination?.pages || 1);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      productName: product.productName,
      category: product.category,
      quantityInStock: product.quantityInStock,
      unitPrice: product.unitPrice,
      supplierName: product.supplierName,
      dateReceived: product.dateReceived?.split('T')[0] || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.productName.trim()) { toast.error('Product name is required'); return; }
    if (!form.category.trim()) { toast.error('Category is required'); return; }
    if (!form.supplierName.trim()) { toast.error('Supplier name is required'); return; }
    if (form.quantityInStock < 0) { toast.error('Quantity cannot be negative'); return; }
    if (form.unitPrice < 0) { toast.error('Unit price cannot be negative'); return; }
    if (!form.dateReceived) { toast.error('Date received is required'); return; }
    setSubmitting(true);
    try {
      if (editing) {
        await productService.updateProduct(editing._id, form);
        toast.success('Product updated');
      } else {
        await productService.createProduct(form);
        toast.success('Product created');
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (product) => {
    setDeleteTarget(product);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    try {
      await productService.deleteProduct(deleteTarget._id);
      toast.success('Product deleted');
      setConfirmOpen(false);
      setDeleteTarget(null);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const columns = [
    { key: 'productCode', label: 'Code' },
    { key: 'productName', label: 'Name' },
    { key: 'category', label: 'Category' },
    { key: 'quantityInStock', label: 'Stock Qty' },
    { key: 'unitPrice', label: 'Unit Price', render: (v) => `${Number(v || 0).toLocaleString()} Frw` },
    { key: 'supplierName', label: 'Supplier' },
    {
      key: 'dateReceived', label: 'Date Received',
      render: (v) => v ? new Date(v).toLocaleDateString() : '-',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Products</h2>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
          <Plus size={18} /> Add Product
        </button>
      </div>

      <div className="relative max-w-xs">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search products..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <DataTable columns={columns} data={products} loading={loading}
          onEdit={openEdit} onDelete={confirmDelete}
          page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Product' : 'Add Product'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-xs text-gray-400">Product code will be auto-generated (PRD-001, PRD-002...)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
              <input type="text" value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <input type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity in Stock *</label>
              <input type="number" min="0" value={form.quantityInStock}
                onChange={(e) => setForm({ ...form, quantityInStock: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price *</label>
              <input type="number" min="0" step="0.01" value={form.unitPrice}
                onChange={(e) => setForm({ ...form, unitPrice: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name *</label>
              <input type="text" value={form.supplierName} onChange={(e) => setForm({ ...form, supplierName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Received *</label>
              <input type="date" value={form.dateReceived}
                onChange={(e) => setForm({ ...form, dateReceived: e.target.value })}
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
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.productName}"?`} />
    </div>
  );
};

export default ProductList;
