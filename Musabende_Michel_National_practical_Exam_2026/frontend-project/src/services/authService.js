import apiClient from './apiClient';

const authService = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  logout: () => apiClient.post('/auth/logout'),
  getMe: () => apiClient.get('/auth/me'),
  checkSession: () => apiClient.get('/auth/session'),
  getSecurityQuestion: (username) => apiClient.get(`/auth/security-question/${username}`),
  recoverPassword: (data) => apiClient.post('/auth/recover-password', data),
  generateCode: (type) => apiClient.get(`/auth/generate-code/${type}`),
};

export default authService;
