import apiClient from './apiClient';

export const getWarehouses = (params) => apiClient.get('/warehouses', { params });
export const getWarehouseById = (id) => apiClient.get(`/warehouses/${id}`);
export const createWarehouse = (data) => apiClient.post('/warehouses', data);
export const updateWarehouse = (id, data) => apiClient.put(`/warehouses/${id}`, data);
export const deleteWarehouse = (id) => apiClient.delete(`/warehouses/${id}`);
