import apiClient from './apiClient';

export const getProducts = async (search = '') => {
  const params = search ? { search } : {};
  const res = await apiClient.get('/products', { params });
  return res.data;
};

export const getProduct = async (id) => {
  const res = await apiClient.get(`/products/${id}`);
  return res.data;
};

export const createProduct = async (data) => {
  const res = await apiClient.post('/products', data);
  return res.data;
};

export const updateProduct = async (id, data) => {
  const res = await apiClient.put(`/products/${id}`, data);
  return res.data;
};

export const deleteProduct = async (id) => {
  const res = await apiClient.delete(`/products/${id}`);
  return res.data;
};
