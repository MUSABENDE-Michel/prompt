import apiClient from './apiClient';

export const getStockStatuses = async (params = {}) => {
  const res = await apiClient.get('/stock-status', { params });
  return res.data;
};

export const getStockStatus = async (id) => {
  const res = await apiClient.get(`/stock-status/${id}`);
  return res.data;
};

export const createStockStatus = async (data) => {
  const res = await apiClient.post('/stock-status', data);
  return res.data;
};

export const updateStockStatus = async (id, data) => {
  const res = await apiClient.put(`/stock-status/${id}`, data);
  return res.data;
};

export const deleteStockStatus = async (id) => {
  const res = await apiClient.delete(`/stock-status/${id}`);
  return res.data;
};
