import pool from '../config/db.js';
import Leave from '../models/Leave.js';
import Payroll from '../models/Payroll.js';
import Employee from '../models/Employee.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { NotFoundError } from '../utils/errors.js';
import { authService } from './authService.js';

export const adminService = {
  // Employee Directory CRUD
  getAllEmployees: async (search = '', department = '') => {
    return Employee.getAll({ search, department_id: department });
  },

  addEmployee: async (employeeData) => {
    // Register employee transactionally using default password
    const result = await authService.register({
      name: employeeData.full_name,
      email: employeeData.email,
      password: employeeData.password || 'password123',
      role: employeeData.role || 'Employee',
      phone: employeeData.phone,
      address: employeeData.address,
      department_id: employeeData.department_id,
      designation: employeeData.designation,
      salary: employeeData.salary
    });

    // Send notification
    await Notification.create({
      employeeId: result.employee.employee_id,
      title: 'Welcome to HRMS',
      message: `Your profile has been created by the HR Administrator. Default password is password123.`,
      type: 'Announcement'
    });

    return result;
  },

  editEmployee: async (employeeId, employeeData) => {
    const updated = await Employee.update(employeeId, {
      full_name: employeeData.full_name,
      phone: employeeData.phone,
      address: employeeData.address,
      department_id: employeeData.department_id,
      designation: employeeData.designation,
      salary: employeeData.salary,
      profile_image: employeeData.profile_image
    });

    if (!updated) throw new NotFoundError('Employee not found');
    return updated;
  },

  deleteEmployee: async (employeeId) => {
    return Employee.delete(employeeId);
  },

  // Attendance Supervision
  getAllAttendance: async (date = '', employeeId = '') => {
    return Attendance.getAll({ date, employeeId });
  },

  editAttendance: async (attendanceId, attendanceData) => {
    const updated = await Attendance.update(attendanceId, {
      check_in_time: attendanceData.check_in_time,
      check_out_time: attendanceData.check_out_time,
      attendance_status: attendanceData.attendance_status,
      remarks: attendanceData.remarks
    });

    if (!updated) throw new NotFoundError('Attendance record not found');
    return updated;
  },

  // Leave Reviews
  approveLeave: async (leaveId, approvedBy) => {
    const leave = await Leave.updateStatus(leaveId, {
      status: 'Approved',
      approvedBy,
      remarks: 'Approved by administrator'
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

  // Payroll Processing
  processPayroll: async (employeeId, { bonus = 0, deductions = 0, month, year, generatedBy }) => {
    const employee = await Employee.findById(employeeId);
    if (!employee) throw new NotFoundError('Employee not found');

    const basicSalary = parseFloat(employee.salary);
    const netSalary = basicSalary + parseFloat(bonus) - parseFloat(deductions);

    const record = await Payroll.create({
      employeeId,
      month,
      year: parseInt(year),
      basicSalary,
      bonus: parseFloat(bonus),
      deductions: parseFloat(deductions),
      netSalary,
      generatedBy
    });

    // Notify employee
    await Notification.create({
      employeeId,
      title: 'Payroll Generated',
      message: `Your salary statement for ${month} ${year} has been generated.`,
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
    // Total employees count
    const empCountRes = await pool.query("SELECT COUNT(*) FROM employees");
    const totalEmployees = parseInt(empCountRes.rows[0].count);

    // Present today
    const presentRes = await pool.query(`
      SELECT COUNT(*) FROM attendance 
      WHERE attendance_date = CURRENT_DATE AND attendance_status = 'Present'
    `);
    const presentToday = parseInt(presentRes.rows[0].count);

    // Absent today
    const absentToday = Math.max(0, totalEmployees - presentToday);

    // Pending Leaves
    const pendingRes = await pool.query("SELECT COUNT(*) FROM leave_requests WHERE status = 'Pending'");
    const pendingLeaves = parseInt(pendingRes.rows[0].count);

    // Approved Leaves
    const approvedRes = await pool.query("SELECT COUNT(*) FROM leave_requests WHERE status = 'Approved'");
    const approvedLeaves = parseInt(approvedRes.rows[0].count);

    // Department Count
    const deptCountRes = await pool.query("SELECT COUNT(*) FROM departments");
    const departmentCount = parseInt(deptCountRes.rows[0].count);

    // Total Payroll (All time or last month)
    const payrollRes = await pool.query("SELECT COALESCE(SUM(net_salary), 0) FROM payroll");
    const totalPayroll = parseFloat(payrollRes.rows[0].coalesce);

    // Department distribution
    const deptDistRes = await pool.query(`
      SELECT d.department_name as name, COUNT(e.employee_id)::int as value
      FROM departments d
      LEFT JOIN employees e ON d.department_id = e.department_id
      GROUP BY d.department_name
    `);

    // Leave distribution by type
    const leaveDistRes = await pool.query(`
      SELECT leave_type as type, COUNT(*)::int as count
      FROM leave_requests
      GROUP BY leave_type
    `);

    // Payroll history by month
    const payrollHistoryRes = await pool.query(`
      SELECT month || ' ' || year::text as period, SUM(net_salary)::float as amount
      FROM payroll
      GROUP BY year, month
      ORDER BY year DESC, month DESC
      LIMIT 6
    `);

    // Attendance trend
    const attendanceTrendRes = await pool.query(`
      SELECT attendance_date::text as date,
             COUNT(*) FILTER (WHERE attendance_status = 'Present')::int as present,
             COUNT(*) FILTER (WHERE attendance_status = 'Absent')::int as absent
      FROM attendance
      GROUP BY attendance_date
      ORDER BY attendance_date DESC
      LIMIT 7
    `);

    return {
      stats: {
        totalEmployees,
        presentToday,
        absentToday,
        pendingLeaves,
        approvedLeaves,
        departmentCount,
        totalPayrollThisMonth: totalPayroll
      },
      charts: {
        departmentDistribution: deptDistRes.rows,
        leaveStatistics: leaveDistRes.rows,
        payrollStatistics: payrollHistoryRes.rows,
        attendanceTrend: attendanceTrendRes.rows.reverse()
      }
    };
  }
};

// Import Attendance inside methods to resolve circular issues if any
import Attendance from '../models/Attendance.js';
