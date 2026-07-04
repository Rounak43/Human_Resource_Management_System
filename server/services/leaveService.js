import Leave from '../models/Leave.js';
import Employee from '../models/Employee.js';
import Notification from '../models/Notification.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';

export const leaveService = {
  applyLeave: async (userId, { leaveType, startDate, endDate, remarks, reason, attachmentUrl, attachment }) => {
    const employee = await Employee.findByUserId(userId);
    if (!employee) {
      throw new NotFoundError('Employee profile not found');
    }

    const sDate = new Date(startDate);
    const eDate = new Date(endDate);
    if (eDate < sDate) {
      throw new BadRequestError('Invalid leave date range selected');
    }

    const leaveRequest = await Leave.create({
      employeeId: employee.employee_id,
      leaveType,
      startDate,
      endDate,
      reason: reason || remarks,
      attachmentUrl: attachmentUrl || attachment
    });

    // Automatically trigger notification for the first HR Manager ('1')
    try {
      await Notification.create({
        employeeId: '1',
        title: 'New Leave Request Pending',
        message: `Employee ${employee.full_name} requested ${leaveType} from ${sDate.toLocaleDateString()} to ${eDate.toLocaleDateString()}.`,
        type: 'Leave'
      });
    } catch (err) {
      console.error('Failed to generate admin leave notification', err);
    }

    return leaveRequest;
  },

  getHistory: async (userId) => {
    const employee = await Employee.findByUserId(userId);
    if (!employee) {
      throw new NotFoundError('Employee profile not found');
    }

    return Leave.findByEmployee(employee.employee_id);
  }
};
