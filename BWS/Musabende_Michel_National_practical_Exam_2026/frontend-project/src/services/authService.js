import apiClient from './apiClient';

export const loginUser = async (username, password) => {
  const res = await apiClient.post('/auth/login', { username, password });
  return res.data;
};

export const registerUser = async (userData) => {
  const res = await apiClient.post('/auth/register', userData);
  return res.data;
};

export const logoutUser = async () => {
  const res = await apiClient.post('/auth/logout');
  return res.data;
};

export const checkSession = async () => {
  const res = await apiClient.get('/auth/session');
  return res.data;
};

export const getSecurityQuestion = async (username) => {
  const res = await apiClient.get(`/auth/security-question/${username}`);
  return res.data;
};

export const verifySecurityAnswer = async (username, answer) => {
  const res = await apiClient.post('/auth/verify-answer', { username, answer });
  return res.data;
};

export const resetPassword = async (resetToken, newPassword) => {
  const res = await apiClient.post('/auth/reset-password', { resetToken, newPassword });
  return res.data;
};
