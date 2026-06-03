import apiClient from './apiClient';

const productService = {
  getAll: (search) => apiClient.get(`/products${search ? `?search=${search}` : ''}`),
  getById: (id) => apiClient.get(`/products/${id}`),
  create: (data) => apiClient.post('/products', data),
  update: (id, data) => apiClient.put(`/products/${id}`, data),
  remove: (id) => apiClient.delete(`/products/${id}`),
};

export default productService;
