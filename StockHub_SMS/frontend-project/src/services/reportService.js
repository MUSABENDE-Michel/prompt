import apiClient from './apiClient';

export const getDashboard = () => apiClient.get('/reports/dashboard');
export const getStockReport = () => apiClient.get('/reports/stock-report');
export const getStockInReport = (params) => apiClient.get('/reports/stock-in-report', { params });
export const getStockOutReport = (params) => apiClient.get('/reports/stock-out-report', { params });
export const getDailyReport = (params) => apiClient.get('/reports/daily-report', { params });
export const getWeeklyReport = (params) => apiClient.get('/reports/weekly-report', { params });
export const getMonthlyReport = (params) => apiClient.get('/reports/monthly-report', { params });
export const exportPDF = () => apiClient.get('/reports/export/pdf', { responseType: 'blob' });
