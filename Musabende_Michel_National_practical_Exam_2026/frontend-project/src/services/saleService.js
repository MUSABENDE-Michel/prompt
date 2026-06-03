import apiClient from './apiClient';

const saleService = {
  getAll: (search) => apiClient.get(`/sales${search ? `?search=${search}` : ''}`),
  getById: (id) => apiClient.get(`/sales/${id}`),
  create: (data) => apiClient.post('/sales', data),
  update: (id, data) => apiClient.put(`/sales/${id}`, data),
  remove: (id) => apiClient.delete(`/sales/${id}`),
};

export default saleService;
