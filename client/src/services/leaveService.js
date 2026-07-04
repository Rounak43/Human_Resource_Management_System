import api from './api';

export const leaveService = {
  applyLeave: async (leaveRequestData) => {
    return api.post('/leave/apply', leaveRequestData);
  },
  getLeaveHistory: async () => {
    return api.get('/leave/history');
  }
};
