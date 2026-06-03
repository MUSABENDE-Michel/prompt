import { useState, useEffect, useCallback } from 'react';
import productService from '../services/productService';
import { useToast } from '../contexts/ToastContext';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import useDebounce from '../hooks/useDebounce';
import { Plus } from 'lucide-react';

const emptyForm = { productName: '', quantitySold: '', unitPrice: '' };

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const debouncedSearch = useDebounce(search, 400);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productService.getAll(debouncedSearch);
      if (res.data.success) setProducts(res.data.data);
    } catch {
      addToast('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, addToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      productName: product.productName,
      quantitySold: String(product.quantitySold),
      unitPrice: String(product.unitPrice),
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.productName || !form.quantitySold || !form.unitPrice) {
      addToast('All fields are required', 'error');
      return;
    }
    if (Number(form.quantitySold) < 0 || Number(form.unitPrice) < 0) {
      addToast('Values cannot be negative', 'error');
      return;
    }
    setSaving(true);
    try {
      const data = { ...form, quantitySold: Number(form.quantitySold), unitPrice: Number(form.unitPrice) };
      if (editing) {
        await productService.update(editing._id, data);
        addToast('Product updated', 'success');
      } else {
        await productService.create(data);
        addToast('Product created', 'success');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Operation failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await productService.remove(deleteTarget._id);
      addToast('Product deleted', 'success');
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Delete failed', 'error');
    }
    setDeleteTarget(null);
  };

  const columns = [
    { key: 'productCode', label: 'Code' },
    { key: 'productName', label: 'Name' },
    { key: 'quantitySold', label: 'Qty Sold' },
    {
      key: 'unitPrice',
      label: 'Unit Price',
      render: (row) => `FRW ${row.unitPrice?.toLocaleString()}`,
    },
    {
      key: 'totalValue',
      label: 'Total Value',
      render: (row) => (
        <span className="text-emerald-400 font-medium">
          FRW {(row.quantitySold * row.unitPrice)?.toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Products</h1>
        <button onClick={openCreate} className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm transition-colors">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-600 p-4">
        <DataTable
          columns={columns}
          data={products}
          onEdit={openEdit}
          onDelete={setDeleteTarget}
          search={search}
          onSearchChange={setSearch}
          loading={loading}
        />
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Product' : 'Add Product'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Product Name</label>
            <input value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" placeholder="Product name" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Quantity Sold</label>
              <input type="number" min="0" value={form.quantitySold} onChange={(e) => setForm({ ...form, quantitySold: e.target.value })} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Unit Price (FRW)</label>
              <input type="number" min="0" step="0.01" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: e.target.value })} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" placeholder="0.00" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg text-sm transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-lg text-sm transition-colors">
              {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Delete ${deleteTarget?.productName}? This action cannot be undone.`}
      />
    </div>
  );
}
