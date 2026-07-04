// client/src/services/attendanceService.js
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({ baseURL: API_BASE });

// attach auth token automatically (assumes you store it after login)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const attendanceService = {
  // ----- Employee -----
  checkIn: (payload = {}) => api.post("/attendance/check-in", payload),
  checkOut: (payload = {}) => api.post("/attendance/check-out", payload),
  getToday: () => api.get("/attendance/me/today"),
  getRange: (startDate, endDate) =>
    api.get("/attendance/me", { params: { startDate, endDate } }),
  getMonthlySummary: (year, month) =>
    api.get("/attendance/me/summary", { params: { year, month } }),

  // ----- Admin -----
  getAllByDate: (date) => api.get(`/attendance/admin/date/${date}`),
  getAllByRange: (startDate, endDate, employeeId) =>
    api.get("/attendance/admin/range", { params: { startDate, endDate, employeeId } }),
  updateAttendance: (employeeId, date, payload) =>
    api.put(`/attendance/admin/${employeeId}/${date}`, payload),
};

export default attendanceService;
