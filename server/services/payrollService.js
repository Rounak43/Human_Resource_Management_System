import Payroll from '../models/Payroll.js';
import Employee from '../models/Employee.js';
import { NotFoundError } from '../utils/errors.js';

export const payrollService = {
  getSalaryStatements: async (userId) => {
    const employee = await Employee.findByUserId(userId);
    if (!employee) {
      throw new NotFoundError('Employee profile not found');
    }

    return Payroll.findByEmployee(employee.employee_id);
  }
};
