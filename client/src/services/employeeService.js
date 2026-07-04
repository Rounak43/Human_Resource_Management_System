import api from './api';

export const employeeService = {
  getProfile: async () => {
    return api.get('/employee/profile');
  },
  updateProfile: async (profileData) => {
    return api.patch('/employee/profile', profileData);
  }
};
