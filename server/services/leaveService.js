import Leave from '../models/Leave.js';
import Employee from '../models/Employee.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';
import { calculateDateDifference } from '../utils/helpers.js';

export const leaveService = {
  applyLeave: async (userId, { leaveType, startDate, endDate, remarks }) => {
    const employee = await Employee.findByUserId(userId);
    if (!employee) {
      throw new NotFoundError('Employee profile not found');
    }

    const duration = calculateDateDifference(startDate, endDate);
    if (duration <= 0) {
      throw new BadRequestError('Invalid leave date range selected');
    }

    return Leave.create({
      employeeId: employee.employee_id,
      leaveType,
      startDate,
      endDate,
      remarks
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
