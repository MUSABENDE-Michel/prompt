import apiClient from './apiClient';

export const getBills = (params) => apiClient.get('/bills', { params });
export const getBill = (id) => apiClient.get(`/bills/${id}`);
export const createBill = (data) => apiClient.post('/bills', data);
export const updateBillStatus = (id, status) => apiClient.patch(`/bills/${id}/status`, { status });
export const deleteBill = (id) => apiClient.delete(`/bills/${id}`);
