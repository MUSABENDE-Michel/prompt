import apiClient from './apiClient';

export const login = (credentials) => apiClient.post('/auth/login', credentials);
export const register = (data) => apiClient.post('/auth/register', data);
export const logout = () => apiClient.post('/auth/logout');
export const getSession = () => apiClient.get('/auth/session');
export const getSecurityQuestion = (username) => apiClient.get(`/auth/security-question/${username}`);
export const recoverPassword = (data) => apiClient.post('/auth/recover-password', data);
