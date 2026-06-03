import axios from 'axios';
import toast from 'react-hot-toast';

const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

let isRedirecting = false;

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !isRedirecting) {
      const url = error.config?.url || '';
      if (!url.includes('/auth/session') && !url.includes('/auth/login')) {
        isRedirecting = true;
        toast.error('Session expired. Please login again.');
        setTimeout(() => {
          isRedirecting = false;
          window.location.href = '/login';
        }, 1500);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
