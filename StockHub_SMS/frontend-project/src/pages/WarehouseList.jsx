import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Plus, Search } from 'lucide-react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import useDebounce from '../hooks/useDebounce';
import * as warehouseService from '../services/warehouseService';

const initialForm = { warehouseName: '', warehouseLocation: '' };

const WarehouseList = () => {
  const [warehouses, setWarehouses] = useState([]);
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

  const fetchWarehouses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await warehouseService.getWarehouses({ page, limit: 10, search: debouncedSearch });
      setWarehouses(res.data.data);
      setTotalPages(res.data.pagination?.pages || 1);
    } catch {
      toast.error('Failed to load warehouses');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => { fetchWarehouses(); }, [fetchWarehouses]);

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  const openEdit = (warehouse) => {
    setEditing(warehouse);
    setForm({
      warehouseName: warehouse.warehouseName,
      warehouseLocation: warehouse.warehouseLocation,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.warehouseName.trim()) { toast.error('Warehouse name is required'); return; }
    if (!form.warehouseLocation.trim()) { toast.error('Warehouse location is required'); return; }
    setSubmitting(true);
    try {
      if (editing) {
        await warehouseService.updateWarehouse(editing._id, form);
        toast.success('Warehouse updated');
      } else {
        await warehouseService.createWarehouse(form);
        toast.success('Warehouse created');
      }
      setModalOpen(false);
      fetchWarehouses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (warehouse) => {
    setDeleteTarget(warehouse);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    try {
      await warehouseService.deleteWarehouse(deleteTarget._id);
      toast.success('Warehouse deleted');
      setConfirmOpen(false);
      setDeleteTarget(null);
      fetchWarehouses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const columns = [
    { key: 'warehouseCode', label: 'Code' },
    { key: 'warehouseName', label: 'Name' },
    { key: 'warehouseLocation', label: 'Location' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Warehouses</h2>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
          <Plus size={18} /> Add Warehouse
        </button>
      </div>

      <div className="relative max-w-xs">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search warehouses..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <DataTable columns={columns} data={warehouses} loading={loading}
          onEdit={openEdit} onDelete={confirmDelete}
          page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Warehouse' : 'Add Warehouse'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-xs text-gray-400">Warehouse code will be auto-generated (WH-001, WH-002...)</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse Name *</label>
            <input type="text" value={form.warehouseName} onChange={(e) => setForm({ ...form, warehouseName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
            <input type="text" value={form.warehouseLocation} onChange={(e) => setForm({ ...form, warehouseLocation: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" required />
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
        title="Delete Warehouse"
        message={`Are you sure you want to delete "${deleteTarget?.warehouseName}"?`} />
    </div>
  );
};

export default WarehouseList;
