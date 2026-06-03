import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts, deleteProduct } from '../services/productService';
import { useDebounce } from '../hooks/useDebounce';
import { useToast } from '../components/Toast';
import { useAutoGenerate } from '../hooks/useAutoGenerate';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import AutoGenerateField from '../components/AutoGenerateField';
import { Plus } from 'lucide-react';

const initialForm = { productName: '', category: '', quantity: '', unitPrice: '' };

export default function ProductList() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { generatedId, generateId } = useAutoGenerate('PRD');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [confirm, setConfirm] = useState({ open: false, id: null });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getProducts(debouncedSearch);
      setProducts(res.data || []);
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => { loadData(); }, [loadData]);

  const openAdd = () => {
    setEditing(null);
    setForm(initialForm);
    setErrors({});
    generateId();
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      productName: product.productName,
      category: product.category,
      quantity: String(product.quantity),
      unitPrice: String(product.unitPrice),
    });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const errs = {};
    if (!form.productName.trim()) errs.productName = 'Product name is required';
    if (!form.category.trim()) errs.category = 'Category is required';
    if (!form.quantity || Number(form.quantity) < 0) errs.quantity = 'Valid quantity required';
    if (!form.unitPrice || Number(form.unitPrice) < 0) errs.unitPrice = 'Valid unit price required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        productName: form.productName.trim(),
        category: form.category.trim(),
        quantity: Number(form.quantity),
        unitPrice: Number(form.unitPrice),
      };

      if (editing) {
        await import('../services/productService').then((m) => m.updateProduct(editing._id, payload));
        addToast('Product updated successfully', 'success');
      } else {
        await import('../services/productService').then((m) => m.createProduct(payload));
        addToast('Product created successfully', 'success');
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Operation failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProduct(confirm.id);
      addToast('Product deleted successfully', 'success');
      setConfirm({ open: false, id: null });
      loadData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Delete failed', 'error');
    }
  };

  const columns = [
    { header: 'Product Name', accessor: 'productName' },
    { header: 'Category', accessor: 'category' },
    {
      header: 'Quantity',
      accessor: 'quantity',
      render: (val) => <span className="font-medium">{val}</span>,
    },
    {
      header: 'Unit Price',
      accessor: 'unitPrice',
      render: (val) => `${Number(val).toLocaleString()} RWF`,
    },
    {
      header: 'Total Price',
      accessor: 'totalPrice',
      render: (val) => `${Number(val).toLocaleString()} RWF`,
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Products</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your product inventory</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          <span>Add Product</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <DataTable
          columns={columns}
          data={products}
          loading={loading}
          onSearch={setSearch}
          onEdit={openEdit}
          onDelete={(row) => setConfirm({ open: true, id: row._id })}
        />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Product' : 'Add Product'}>
        <form onSubmit={handleSave} className="space-y-4">
          <AutoGenerateField label="Product ID" value={generatedId} onGenerate={generateId} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
            <input type="text" value={form.productName}
              onChange={(e) => setForm({ ...form, productName: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 ${errors.productName ? 'border-red-400' : 'border-gray-300'}`}
            />
            {errors.productName && <p className="text-xs text-red-500 mt-1">{errors.productName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <input type="text" value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 ${errors.category ? 'border-red-400' : 'border-gray-300'}`}
            />
            {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
              <input type="number" value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 ${errors.quantity ? 'border-red-400' : 'border-gray-300'}`}
              />
              {errors.quantity && <p className="text-xs text-red-500 mt-1">{errors.quantity}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price *</label>
              <input type="number" value={form.unitPrice}
                onChange={(e) => setForm({ ...form, unitPrice: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 ${errors.unitPrice ? 'border-red-400' : 'border-gray-300'}`}
              />
              {errors.unitPrice && <p className="text-xs text-red-500 mt-1">{errors.unitPrice}</p>}
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >Cancel</button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? This will also remove its stock status."
      />
    </div>
  );
}
