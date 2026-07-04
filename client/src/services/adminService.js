import api from './api';

export const adminService = {
  // Employee Directory CRUD
  getAllEmployees: async (search = '', department = '') => {
    return api.get(`/admin/employees?search=${search}&department=${department}`);
  },
  addEmployee: async (employeeData) => {
    return api.post('/admin/employees', employeeData);
  },
  editEmployee: async (id, employeeData) => {
    return api.put(`/admin/employees/${id}`, employeeData);
  },
  deleteEmployee: async (id) => {
    return api.delete(`/admin/employees/${id}`);
  },

  // Attendance Supervision
  getAllAttendance: async (date) => {
    return api.get(`/admin/attendance?date=${date}`);
  },
  editAttendance: async (id, data) => {
    return api.put(`/admin/attendance/${id}`, data);
  },

  // Leave Reviews
  getLeaveRequests: async () => {
    return api.get('/admin/leaves');
  },
  approveLeave: async (id) => {
    return api.patch(`/admin/leaves/${id}/approve`);
  },
  rejectLeave: async (id, comment) => {
    return api.patch(`/admin/leaves/${id}/reject`, { adminComment: comment });
  },

  // Payroll releases
  getPayrollRecords: async (month) => {
    return api.get(`/admin/payroll?month=${month}`);
  },
  updateSalaryConfig: async (employeeId, salaryData) => {
    return api.put(`/admin/payroll/salary/${employeeId}`, salaryData);
  },

  // Operations reports
  getReports: async () => {
    return api.get('/admin/reports');
  }
};
