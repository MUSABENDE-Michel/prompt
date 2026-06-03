import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRedirecting = false;

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !isRedirecting) {
      isRedirecting = true;
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/recovery' && currentPath !== '/') {
        window.location.href = '/login';
      }
      setTimeout(() => {
        isRedirecting = false;
      }, 3000);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
