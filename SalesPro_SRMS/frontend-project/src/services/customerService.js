import apiClient from './apiClient';

const customerService = {
  getAll: (search) => apiClient.get(`/customers${search ? `?search=${search}` : ''}`),
  getById: (id) => apiClient.get(`/customers/${id}`),
  create: (data) => apiClient.post('/customers', data),
  update: (id, data) => apiClient.put(`/customers/${id}`, data),
  remove: (id) => apiClient.delete(`/customers/${id}`),
};

export default customerService;
