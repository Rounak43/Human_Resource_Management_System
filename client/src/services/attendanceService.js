import api from './api';

export const attendanceService = {
  checkIn: async (timeString) => {
    return api.post('/attendance/check-in', { checkInTime: timeString });
  },
  checkOut: async (timeString) => {
    return api.post('/attendance/check-out', { checkOutTime: timeString });
  },
  getWeeklyAttendance: async () => {
    return api.get('/attendance/weekly');
  },
  getMonthlyAttendance: async (month) => {
    return api.get(`/attendance/history?month=${month}`);
  }
};
