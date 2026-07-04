import Leave from '../models/Leave.js';
import Employee from '../models/Employee.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';

export const leaveService = {
  applyLeave: async (userId, { leaveType, startDate, endDate, remarks }) => {
    const employee = await Employee.findByUserId(userId);
    if (!employee) {
      throw new NotFoundError('Employee profile not found');
    }

    const sDate = new Date(startDate);
    const eDate = new Date(endDate);
    if (eDate < sDate) {
      throw new BadRequestError('Invalid leave date range selected');
    }

    return Leave.create({
      employeeId: employee.employee_id,
      leaveType,
      startDate,
      endDate,
      reason: remarks
    });
  },

  getHistory: async (userId) => {
    const employee = await Employee.findByUserId(userId);
    if (!employee) {
      throw new NotFoundError('Employee profile not found');
    }

    return Leave.findByEmployee(employee.employee_id);
  }
};
