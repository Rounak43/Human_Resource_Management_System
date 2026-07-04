import api from './api';

export const authService = {
  login: async (email, password) => {
    return api.post('/auth/login', { email, password });
  },
  register: async (userData) => {
    return api.post('/auth/register', userData);
  },
  forgotPassword: async (email) => {
    return api.post('/auth/forgot-password', { email });
  }
};
