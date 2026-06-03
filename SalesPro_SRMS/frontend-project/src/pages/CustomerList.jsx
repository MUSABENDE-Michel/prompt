import { useState, useEffect, useCallback } from 'react';
import customerService from '../services/customerService';
import { useToast } from '../contexts/ToastContext';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import AutoGenerateField from '../components/AutoGenerateField';
import useDebounce from '../hooks/useDebounce';
import { Plus } from 'lucide-react';

const emptyForm = { firstName: '', lastName: '', telephone: '', address: '' };

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
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
      const res = await customerService.getAll(debouncedSearch);
      if (res.data.success) setCustomers(res.data.data);
    } catch {
      addToast('Failed to load customers', 'error');
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

  const openEdit = (customer) => {
    setEditing(customer);
    setForm({
      firstName: customer.firstName,
      lastName: customer.lastName,
      telephone: customer.telephone,
      address: customer.address,
    });
    setModalOpen(true);
  };

  const validateRwandanPhone = (phone) => /^(\+250|0)7[0-9]{8}$/.test(phone);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.telephone || !form.address) {
      addToast('All fields are required', 'error');
      return;
    }
    if (!validateRwandanPhone(form.telephone)) {
      addToast('Phone must be a valid Rwandan number: +2507XXXXXXXX or 07XXXXXXXX', 'error');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await customerService.update(editing._id, form);
        addToast('Customer updated', 'success');
      } else {
        await customerService.create(form);
        addToast('Customer created', 'success');
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
      await customerService.remove(deleteTarget._id);
      addToast('Customer deleted', 'success');
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Delete failed', 'error');
    }
    setDeleteTarget(null);
  };

  const columns = [
    { key: 'customerNumber', label: 'Number' },
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'telephone', label: 'Telephone' },
    {
      key: 'address',
      label: 'Address',
      render: (row) => (
        <span className="text-slate-400 max-w-[200px] truncate block">{row.address}</span>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Customers</h1>
        <button onClick={openCreate} className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm transition-colors">
          <Plus className="w-4 h-4" /> Add Customer
        </button>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-600 p-4">
        <DataTable
          columns={columns}
          data={customers}
          onEdit={openEdit}
          onDelete={setDeleteTarget}
          search={search}
          onSearchChange={setSearch}
          loading={loading}
        />
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Customer' : 'Add Customer'}>
        <form onSubmit={handleSave} className="space-y-4">
          {!editing && (
            <AutoGenerateField type="customer" value={''} onChange={() => {}} />
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">First Name</label>
              <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" placeholder="First name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Last Name</label>
              <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" placeholder="Last name" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Telephone</label>
            <input value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" placeholder="+2507XXXXXXXX" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Address</label>
            <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" placeholder="Address" />
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
        title="Delete Customer"
        message={`Delete ${deleteTarget?.firstName} ${deleteTarget?.lastName}? This action cannot be undone.`}
      />
    </div>
  );
}
