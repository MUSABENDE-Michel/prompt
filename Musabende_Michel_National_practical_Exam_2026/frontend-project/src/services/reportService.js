import apiClient from './apiClient';

const reportService = {
  getDashboard: () => apiClient.get('/reports/dashboard'),
  getReport: (type, startDate, endDate) => {
    let url = `/reports/data?type=${type}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    return apiClient.get(url);
  },
  exportData: (type, format, startDate, endDate) => {
    let url = `/reports/export?type=${type}&format=${format}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    return apiClient.get(url);
  },
};

export default reportService;
