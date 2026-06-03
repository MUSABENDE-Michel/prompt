import apiClient from './apiClient';

export const getSales = async (params = {}) => {
  const res = await apiClient.get('/sales', { params });
  return res.data;
};

export const getSale = async (id) => {
  const res = await apiClient.get(`/sales/${id}`);
  return res.data;
};

export const createSale = async (data) => {
  const res = await apiClient.post('/sales', data);
  return res.data;
};

export const updateSale = async (id, data) => {
  const res = await apiClient.put(`/sales/${id}`, data);
  return res.data;
};

export const deleteSale = async (id) => {
  const res = await apiClient.delete(`/sales/${id}`);
  return res.data;
};
