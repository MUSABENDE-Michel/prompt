import { useState, useEffect, useCallback } from 'react';
import saleService from '../services/saleService';
import customerService from '../services/customerService';
import productService from '../services/productService';
import { useToast } from '../contexts/ToastContext';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import useDebounce from '../hooks/useDebounce';
import { Plus, Printer } from 'lucide-react';

const emptyForm = {
  customer: '',
  salesDate: new Date().toISOString().split('T')[0],
  paymentMethod: 'Cash',
  products: [{ product: '', quantity: 1 }],
};

export default function SaleList() {
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [calculatedTotal, setCalculatedTotal] = useState(0);
  const { addToast } = useToast();

  const debouncedSearch = useDebounce(search, 400);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [salesRes, custRes, prodRes] = await Promise.all([
        saleService.getAll(debouncedSearch),
        customerService.getAll(),
        productService.getAll(),
      ]);
      if (salesRes.data.success) setSales(salesRes.data.data);
      if (custRes.data.success) setCustomers(custRes.data.data);
      if (prodRes.data.success) setProducts(prodRes.data.data);
    } catch {
      addToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, addToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    let total = 0;
    form.products.forEach((item) => {
      const prod = products.find((p) => p._id === item.product);
      if (prod) total += prod.unitPrice * (Number(item.quantity) || 1);
    });
    setCalculatedTotal(total);
  }, [form.products, products]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (sale) => {
    setEditing(sale);
    setForm({
      customer: sale.customer?._id || '',
      salesDate: new Date(sale.salesDate).toISOString().split('T')[0],
      paymentMethod: sale.paymentMethod,
      products: sale.products.map((p) => ({
        product: p.product?._id || p.product || '',
        quantity: p.quantity,
      })),
    });
    setModalOpen(true);
  };

  const addProductRow = () => {
    setForm({ ...form, products: [...form.products, { product: '', quantity: 1 }] });
  };

  const removeProductRow = (idx) => {
    if (form.products.length <= 1) return;
    setForm({ ...form, products: form.products.filter((_, i) => i !== idx) });
  };

  const updateProductRow = (idx, field, value) => {
    const updated = [...form.products];
    updated[idx] = { ...updated[idx], [field]: value };
    setForm({ ...form, products: updated });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.customer || !form.salesDate) {
      addToast('Customer and date are required', 'error');
      return;
    }
    const validProducts = form.products.filter((p) => p.product);
    if (validProducts.length === 0) {
      addToast('At least one product is required', 'error');
      return;
    }
    setSaving(true);
    try {
      const data = {
        ...form,
        totalAmountPaid: calculatedTotal,
        products: validProducts.map((p) => ({
          product: p.product,
          quantity: Number(p.quantity),
          unitPrice: products.find((prod) => prod._id === p.product)?.unitPrice || 0,
        })),
      };
      if (editing) {
        await saleService.update(editing._id, data);
        addToast('Sale updated', 'success');
      } else {
        await saleService.create(data);
        addToast('Sale recorded', 'success');
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
      await saleService.remove(deleteTarget._id);
      addToast('Sale deleted', 'success');
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Delete failed', 'error');
    }
    setDeleteTarget(null);
  };

  const printBill = (sale) => {
    const formatNum = (n) => (n || 0).toLocaleString();
    const productsHtml = sale.products?.map(
      (p, i) => `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #ddd;text-align:center">${i + 1}</td>
          <td style="padding:8px;border-bottom:1px solid #ddd">${p.product?.productName || 'N/A'}</td>
          <td style="padding:8px;border-bottom:1px solid #ddd;text-align:center">${p.quantity}</td>
          <td style="padding:8px;border-bottom:1px solid #ddd;text-align:right">FRW ${formatNum(p.unitPrice)}</td>
          <td style="padding:8px;border-bottom:1px solid #ddd;text-align:right">FRW ${formatNum(p.quantity * p.unitPrice)}</td>
        </tr>`
    ).join('');

    const html = `
      <html>
      <head>
        <title>Bill - ${sale.invoiceNumber}</title>
        <style>
          body { font-family: 'Courier New', monospace; margin: 0; padding: 20px; color: #000; }
          .bill { max-width: 700px; margin: auto; border: 2px solid #000; padding: 30px; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px; }
          .header h1 { margin: 0; font-size: 22px; text-transform: uppercase; letter-spacing: 2px; }
          .header p { margin: 3px 0; font-size: 12px; color: #333; }
          .info { width: 100%; margin-bottom: 20px; font-size: 13px; }
          .info td { padding: 2px 5px; vertical-align: top; }
          .info td:first-child { font-weight: bold; width: 130px; }
          table.items { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
          table.items th { background: #000; color: #fff; padding: 8px; text-align: left; }
          .total-row { font-size: 16px; font-weight: bold; }
          .total-row td { border-top: 2px solid #000; padding-top: 10px; }
          .footer { text-align: center; margin-top: 30px; font-size: 11px; border-top: 1px solid #ccc; padding-top: 15px; color: #555; }
          .no-print { text-align: center; margin-top: 20px; }
          .no-print button { padding: 10px 30px; font-size: 14px; cursor: pointer; background: #000; color: #fff; border: none; border-radius: 4px; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="bill">
          <div class="header">
            <h1>SalesPro Ltd</h1>
            <p>Huye District, Southern Province, Rwanda</p>
            <p>Tel: +250 788 000 000 | Email: info@salespro.rw</p>
          </div>

          <table class="info">
            <tr><td>Invoice No:</td><td>${sale.invoiceNumber}</td></tr>
            <tr><td>Date:</td><td>${new Date(sale.salesDate).toLocaleDateString()}</td></tr>
            <tr><td>Customer:</td><td>${sale.customer?.firstName || ''} ${sale.customer?.lastName || ''}</td></tr>
            <tr><td>Phone:</td><td>${sale.customer?.telephone || 'N/A'}</td></tr>
            <tr><td>Payment:</td><td>${sale.paymentMethod}</td></tr>
          </table>

          <table class="items">
            <thead>
              <tr><th style="width:40px">#</th><th>Product</th><th style="width:60px">Qty</th><th style="width:120px">Unit Price</th><th style="width:120px">Total</th></tr>
            </thead>
            <tbody>
              ${productsHtml}
              <tr class="total-row">
                <td colspan="4" style="text-align:right;padding:8px">TOTAL AMOUNT:</td>
                <td style="padding:8px;text-align:right">FRW ${formatNum(sale.totalAmountPaid)}</td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
            <p>Thank you for your business!</p>
            <p>Goods once sold are not returnable. This is a computer-generated invoice.</p>
          </div>
        </div>
        <div class="no-print">
          <button onclick="window.print()">Print Bill</button>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const columns = [
    { key: 'invoiceNumber', label: 'Invoice' },
    {
      key: 'customer',
      label: 'Customer',
      render: (row) => row.customer ? `${row.customer.firstName} ${row.customer.lastName}` : 'N/A',
    },
    {
      key: 'salesDate',
      label: 'Date',
      render: (row) => new Date(row.salesDate).toLocaleDateString(),
    },
    { key: 'paymentMethod', label: 'Payment' },
    {
      key: 'totalAmountPaid',
      label: 'Total',
      render: (row) => <span className="text-emerald-400 font-medium">FRW {row.totalAmountPaid?.toLocaleString()}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(row)} className="text-primary-400 hover:text-primary-300 text-sm transition-colors">Edit</button>
          <button onClick={() => printBill(row)} className="text-emerald-400 hover:text-emerald-300 text-sm transition-colors">Bill</button>
          <button onClick={() => setDeleteTarget(row)} className="text-red-400 hover:text-red-300 text-sm transition-colors">Delete</button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Sales</h1>
        <button onClick={openCreate} className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm transition-colors">
          <Plus className="w-4 h-4" /> Record Sale
        </button>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-600 p-4">
        <DataTable
          columns={columns}
          data={sales}
          search={search}
          onSearchChange={setSearch}
          loading={loading}
        />
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Sale' : 'Record Sale'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Customer</label>
              <select value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm">
                <option value="">Select customer</option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>{c.firstName} {c.lastName} ({c.customerNumber})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Sales Date</label>
              <input type="date" value={form.salesDate} onChange={(e) => setForm({ ...form, salesDate: e.target.value })} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Payment Method</label>
            <select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm">
              <option value="Cash">Cash</option>
              <option value="Mobile Money">Mobile Money</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Products</label>
            {form.products.map((item, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <select value={item.product} onChange={(e) => updateProductRow(idx, 'product', e.target.value)} className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm">
                  <option value="">Select product</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>{p.productName} - FRW {p.unitPrice}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateProductRow(idx, 'quantity', e.target.value)}
                  className="w-20 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm text-center"
                  placeholder="Qty"
                />
                <button type="button" onClick={() => removeProductRow(idx)} className="px-2 py-2 text-red-400 hover:text-red-300 text-sm">X</button>
              </div>
            ))}
            <button type="button" onClick={addProductRow} className="text-primary-400 hover:text-primary-300 text-sm">+ Add product</button>
          </div>

          <div className="p-3 bg-slate-700/50 rounded-lg border border-slate-600 text-right">
            <span className="text-sm text-slate-300">Total: </span>
            <span className="text-lg font-bold text-emerald-400">FRW {calculatedTotal.toLocaleString()}</span>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg text-sm transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-lg text-sm transition-colors">
              {saving ? 'Saving...' : editing ? 'Update' : 'Record Sale'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Sale"
        message={`Delete sale ${deleteTarget?.invoiceNumber}? This action cannot be undone.`}
      />
    </div>
  );
}
