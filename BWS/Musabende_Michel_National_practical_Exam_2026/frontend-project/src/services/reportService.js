import apiClient from './apiClient';

export const getDailySalesReport = async (startDate, endDate) => {
  const res = await apiClient.get('/reports/daily-sales', { params: { startDate, endDate } });
  return res.data;
};

export const getDailyStockReport = async () => {
  const res = await apiClient.get('/reports/daily-stock');
  return res.data;
};

export const exportReport = async (type, format, startDate, endDate) => {
  const res = await apiClient.get('/reports/export', {
    params: { type, format, startDate, endDate },
    responseType: format === 'pdf' || format === 'csv' ? 'blob' : 'json',
  });
  return res.data;
};
