import Employee from '../models/Employee.js';
import User from '../models/User.js';
import Payroll from '../models/Payroll.js';
import Notification from '../models/Notification.js';
import Leave from '../models/Leave.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';
import pool from '../config/db.js';

export const adminService = {
  // ----- Employee List -----
  getAllEmployees: async (search = '', department = '') => {
    return Employee.getAll({ search, department_id: department });
  },

  addEmployee: async (employeeData) => {
    // Falls back to employee creation logic
    const { employeeService } = await import('./employeeService.js');
    return employeeService.createEmployee(employeeData);
  },

  editEmployee: async (employeeId, employeeData) => {
    const { employeeService } = await import('./employeeService.js');
    return employeeService.updateEmployee(employeeId, employeeData);
  },

  deleteEmployee: async (employeeId) => {
    const { employeeService } = await import('./employeeService.js');
    return employeeService.deleteEmployee(employeeId);
  },

  // ----- Attendance logs -----
  getAllAttendance: async (date = '', employeeId = '') => {
    return Attendance.getAll({ date, employeeId });
  },

  editAttendance: async (attendanceId, attendanceData) => {
    const Attendance = (await import('../models/Attendance.js')).default;
    return Attendance.update(attendanceId, attendanceData);
  },

  // ----- Leave Reviews -----
  approveLeave: async (leaveId, comment, approvedBy) => {
    const leave = await Leave.updateStatus(leaveId, {
      status: 'Approved',
      approvedBy,
      remarks: comment || 'Approved by administrator'
    });
    if (!leave) throw new NotFoundError('Leave request not found');

    // Notify employee
    await Notification.create({
      employeeId: leave.employee_id,
      title: 'Leave Request Approved',
      message: `Your leave request from ${new Date(leave.start_date).toLocaleDateString()} has been approved.`,
      type: 'Leave'
    });

    return leave;
  },

  rejectLeave: async (leaveId, comment, approvedBy) => {
    const leave = await Leave.updateStatus(leaveId, {
      status: 'Rejected',
      approvedBy,
      remarks: comment || 'Rejected by administrator'
    });
    if (!leave) throw new NotFoundError('Leave request not found');

    // Notify employee
    await Notification.create({
      employeeId: leave.employee_id,
      title: 'Leave Request Rejected',
      message: `Your leave request from ${new Date(leave.start_date).toLocaleDateString()} has been rejected. Reason: ${comment || 'No reason provided'}.`,
      type: 'Leave'
    });

    return leave;
  },

  // ----- Automated Payroll Processing -----
  processPayroll: async (employeeId, { month, year, generatedBy }) => {
    const employee = await Employee.findById(employeeId);
    if (!employee) throw new NotFoundError('Employee not found');

    const monthMap = {
      'january': 1, 'february': 2, 'march': 3, 'april': 4, 'may': 5, 'june': 6,
      'july': 7, 'august': 8, 'september': 9, 'october': 10, 'november': 11, 'december': 12
    };
    const monthNum = monthMap[month.toLowerCase()] || new Date().getMonth() + 1;
    const yearNum = parseInt(year) || new Date().getFullYear();

    // 1. Fetch Month Attendance logs
    const attRes = await pool.query(
      `SELECT * FROM attendance WHERE employee_id = $1 AND EXTRACT(YEAR FROM attendance_date) = $2 AND EXTRACT(MONTH FROM attendance_date) = $3`,
      [employeeId, yearNum, monthNum]
    );

    // Sum Overtime Hours
    let overtimeHours = 0;
    for (const att of attRes.rows) {
      overtimeHours += parseFloat(att.overtime_hours || 0);
    }

    // 2. Fetch Approved Leave Requests overlapping with query month
    const leavesRes = await pool.query(
      `SELECT * FROM leave_requests WHERE employee_id = $1 AND status = 'Approved' AND (EXTRACT(MONTH FROM start_date) = $2 OR EXTRACT(MONTH FROM end_date) = $2)`,
      [employeeId, monthNum]
    );

    // Sum Unpaid Leave days
    let unpaidDays = 0;
    for (const lr of leavesRes.rows) {
      if (lr.leave_type && lr.leave_type.toLowerCase().includes('unpaid')) {
        unpaidDays += lr.number_of_days;
      }
    }

    // 3. Compute salary allowances and deductions based on employee parameters
    const basicSalary = parseFloat(employee.salary || 0);

    const hra = employee.hra_type === 'percentage' ? basicSalary * (parseFloat(employee.hra_value || 0) / 100) : parseFloat(employee.hra_value || 0);
    const std = employee.standard_allowance_type === 'percentage' ? basicSalary * (parseFloat(employee.standard_allowance_value || 0) / 100) : parseFloat(employee.standard_allowance_value || 0);
    const travel = employee.travel_allowance_type === 'percentage' ? basicSalary * (parseFloat(employee.travel_allowance_value || 0) / 100) : parseFloat(employee.travel_allowance_value || 0);
    const bonus = employee.performance_bonus_type === 'percentage' ? basicSalary * (parseFloat(employee.performance_bonus_value || 0) / 100) : parseFloat(employee.performance_bonus_value || 0);
    const fixed = employee.fixed_allowance_type === 'percentage' ? basicSalary * (parseFloat(employee.fixed_allowance_value || 0) / 100) : parseFloat(employee.fixed_allowance_value || 0);

    const overtimePay = overtimeHours * (basicSalary / 160) * 1.5;

    const pf = employee.provident_fund_type === 'percentage' ? basicSalary * (parseFloat(employee.provident_fund_value || 0) / 100) : parseFloat(employee.provident_fund_value || 0);
    const pt = employee.professional_tax_type === 'percentage' ? basicSalary * (parseFloat(employee.professional_tax_value || 0) / 100) : parseFloat(employee.professional_tax_value || 0);
    const otherDeductions = employee.other_deductions_type === 'percentage' ? basicSalary * (parseFloat(employee.other_deductions_value || 0) / 100) : parseFloat(employee.other_deductions_value || 0);

    const unpaidDeduction = unpaidDays * (basicSalary / 30);

    const grossAllowances = hra + std + travel + bonus + fixed + overtimePay;
    const grossDeductions = pf + pt + otherDeductions + unpaidDeduction;
    const netSalary = basicSalary + grossAllowances - grossDeductions;

    // 4. Save into payroll registry
    const record = await Payroll.create({
      employeeId,
      month,
      year: yearNum,
      basicSalary,
      bonus: parseFloat(grossAllowances.toFixed(2)),
      deductions: parseFloat(grossDeductions.toFixed(2)),
      netSalary: parseFloat(netSalary.toFixed(2)),
      generatedBy
    });

    // 5. Notify employee automatically
    await Notification.create({
      employeeId,
      title: 'Payroll Generated',
      message: `Your salary statement for ${month} ${yearNum} has been generated. Net pay: ₹${parseFloat(netSalary.toFixed(2)).toLocaleString()}.`,
      type: 'Payroll'
    });

    return record;
  },

  getPayrollRecords: async (month = '', year = null) => {
    return Payroll.getAll(month, year);
  },

  updateSalaryConfig: async (employeeId, { salary }) => {
    const query = `
      UPDATE employees
      SET salary = $1, updated_at = CURRENT_TIMESTAMP
      WHERE employee_id = $2
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [salary, employeeId]);
    if (rows.length === 0) throw new NotFoundError('Employee not found');
    return rows[0];
  },

  // Analytics Reports Generation
  generateCompanyReports: async () => {
    const empCountRes = await pool.query("SELECT COUNT(*) FROM employees");
    const totalEmployees = parseInt(empCountRes.rows[0].count);

    const presentRes = await pool.query(`
      SELECT COUNT(*) FROM attendance 
      WHERE attendance_date = CURRENT_DATE AND attendance_status = 'Present'
    `);
    const presentToday = parseInt(presentRes.rows[0].count);

    const absentToday = Math.max(0, totalEmployees - presentToday);

    const pendingRes = await pool.query("SELECT COUNT(*) FROM leave_requests WHERE status = 'Pending'");
    const pendingLeaves = parseInt(pendingRes.rows[0].count);

    const approvedRes = await pool.query("SELECT COUNT(*) FROM leave_requests WHERE status = 'Approved'");
    const approvedLeaves = parseInt(approvedRes.rows[0].count);

    const deptCountRes = await pool.query("SELECT COUNT(*) FROM departments");
    const departmentCount = parseInt(deptCountRes.rows[0].count);

    const payrollRes = await pool.query("SELECT COALESCE(SUM(net_salary), 0) FROM payroll");
    const totalPayroll = parseFloat(payrollRes.rows[0].coalesce);

    const deptDistRes = await pool.query(`
      SELECT d.department_name as name, COUNT(e.employee_id)::int as value
      FROM departments d
      LEFT JOIN employees e ON d.department_id = e.department_id
      GROUP BY d.department_name
    `);

    return {
      totalEmployees,
      presentToday,
      absentToday,
      pendingLeaves,
      approvedLeaves,
      departmentCount,
      totalPayroll,
      departmentDistribution: deptDistRes.rows
    };
  }
};
export default adminService;
