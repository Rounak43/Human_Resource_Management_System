import Attendance from '../models/Attendance.js';
import Employee from '../models/Employee.js';
import { NotFoundError } from '../utils/errors.js';

export const attendanceService = {
  checkIn: async (userId, checkInTime) => {
    const employee = await Employee.findByUserId(userId);
    if (!employee) {
      throw new NotFoundError('Employee profile not found');
    }

    // Business Logic: Check if checkInTime is past 9:00 AM (to mark status as 'late' vs 'present')
    const time = new Date(checkInTime);
    const hours = time.getHours();
    const status = (hours >= 9) ? 'late' : 'present';

    return Attendance.checkIn(employee.employee_id, checkInTime, status);
  },

  checkOut: async (userId, checkOutTime) => {
    const employee = await Employee.findByUserId(userId);
    if (!employee) {
      throw new NotFoundError('Employee profile not found');
    }

    return Attendance.checkOut(employee.employee_id, checkOutTime);
  },

  getHistory: async (userId, month) => {
    const employee = await Employee.findByUserId(userId);
    if (!employee) {
      throw new NotFoundError('Employee profile not found');
    }

    return Attendance.getHistory(employee.employee_id, month);
  }
};
// target: Developer B
