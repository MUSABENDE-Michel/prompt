import { useState, useEffect, useCallback } from 'react';
import { getSales, deleteSale, createSale, updateSale } from '../services/saleService';
import { getProducts } from '../services/productService';
import { useDebounce } from '../hooks/useDebounce';
import { useToast } from '../components/Toast';
import { useAutoGenerate } from '../hooks/useAutoGenerate';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import AutoGenerateField from '../components/AutoGenerateField';
import { Plus } from 'lucide-react';

const initialForm = { product: '', soldQuantity: '', soldUnitPrice: '', salesDate: new Date().toISOString().split('T')[0] };

export default function SaleList() {
  const { addToast } = useToast();
  const { generatedId, generateId } = useAutoGenerate('SALE');
  const [sales, setSales] = useState([]);
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
      const [saleRes, prodRes] = await Promise.all([getSales({ search: debouncedSearch }), getProducts()]);
      setSales(saleRes.data || []);
      setProducts(prodRes.data || []);
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

  const openEdit = (sale) => {
    setEditing(sale);
    setForm({
      product: sale.product?._id || '',
      soldQuantity: String(sale.soldQuantity),
      soldUnitPrice: String(sale.soldUnitPrice),
      salesDate: new Date(sale.salesDate).toISOString().split('T')[0],
    });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const errs = {};
    if (!form.product) errs.product = 'Product is required';
    if (!form.soldQuantity || Number(form.soldQuantity) < 1) errs.soldQuantity = 'Valid quantity required';
    if (!form.soldUnitPrice || Number(form.soldUnitPrice) < 0) errs.soldUnitPrice = 'Valid price required';
    if (!form.salesDate) errs.salesDate = 'Date is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        product: form.product,
        soldQuantity: Number(form.soldQuantity),
        soldUnitPrice: Number(form.soldUnitPrice),
        salesDate: form.salesDate,
      };

      if (editing) {
        await updateSale(editing._id, payload);
        addToast('Sale updated successfully', 'success');
      } else {
        await createSale(payload);
        addToast('Sale recorded successfully', 'success');
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
      await deleteSale(confirm.id);
      addToast('Sale deleted successfully', 'success');
      setConfirm({ open: false, id: null });
      loadData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Delete failed', 'error');
    }
  };

  const columns = [
    {
      header: 'Product',
      accessor: 'product',
      render: (val) => val?.productName || 'N/A',
    },
    {
      header: 'Sold Qty',
      accessor: 'soldQuantity',
      render: (val) => <span className="font-medium">{val}</span>,
    },
    {
      header: 'Unit Price',
      accessor: 'soldUnitPrice',
      render: (val) => `${Number(val).toLocaleString()} RWF`,
    },
    {
      header: 'Total Price',
      accessor: 'soldTotalPrice',
      render: (val) => `${Number(val).toLocaleString()} RWF`,
    },
    {
      header: 'Date',
      accessor: 'salesDate',
      render: (val) => new Date(val).toLocaleDateString(),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Sales</h1>
          <p className="text-sm text-gray-500 mt-1">Record and manage product sales</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
        ><Plus size={16} /><span>Record Sale</span></button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <DataTable columns={columns} data={sales} loading={loading}
          onSearch={setSearch} onEdit={openEdit}
          onDelete={(row) => setConfirm({ open: true, id: row._id })}
        />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Sale' : 'Record Sale'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <AutoGenerateField label="Sale ID" value={generatedId} onGenerate={generateId} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product *</label>
            <select value={form.product}
              onChange={(e) => {
                setForm({ ...form, product: e.target.value });
                const p = products.find((pr) => pr._id === e.target.value);
                if (p && !editing) setForm((prev) => ({ ...prev, product: e.target.value, soldUnitPrice: String(p.unitPrice) }));
              }}
              className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500 ${errors.product ? 'border-red-400' : 'border-gray-300'}`}
            >
              <option value="">Select a product</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>{p.productName} (Stock: {p.quantity})</option>
              ))}
            </select>
            {errors.product && <p className="text-xs text-red-500 mt-1">{errors.product}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sold Quantity *</label>
              <input type="number" value={form.soldQuantity}
                onChange={(e) => setForm({ ...form, soldQuantity: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500 ${errors.soldQuantity ? 'border-red-400' : 'border-gray-300'}`}
              />
              {errors.soldQuantity && <p className="text-xs text-red-500 mt-1">{errors.soldQuantity}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sold Unit Price *</label>
              <input type="number" value={form.soldUnitPrice}
                onChange={(e) => setForm({ ...form, soldUnitPrice: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500 ${errors.soldUnitPrice ? 'border-red-400' : 'border-gray-300'}`}
              />
              {errors.soldUnitPrice && <p className="text-xs text-red-500 mt-1">{errors.soldUnitPrice}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sales Date *</label>
            <input type="date" value={form.salesDate}
              onChange={(e) => setForm({ ...form, salesDate: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500 ${errors.salesDate ? 'border-red-400' : 'border-gray-300'}`}
            />
            {errors.salesDate && <p className="text-xs text-red-500 mt-1">{errors.salesDate}</p>}
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >Cancel</button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
            >{saving ? 'Saving...' : editing ? 'Update' : 'Record'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={confirm.open}
        onClose={() => setConfirm({ open: false, id: null })}
        onConfirm={handleDelete} title="Delete Sale"
        message="Are you sure? This will restore the product quantity."
      />
    </div>
  );
}
