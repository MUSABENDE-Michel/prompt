import apiClient from './apiClient';

export const getTransactions = (params) => apiClient.get('/transactions', { params });
export const getTransactionById = (id) => apiClient.get(`/transactions/${id}`);
export const createTransaction = (data) => apiClient.post('/transactions', data);
export const updateTransaction = (id, data) => apiClient.put(`/transactions/${id}`, data);
export const deleteTransaction = (id) => apiClient.delete(`/transactions/${id}`);
