import pool from '../config/db.js';
import Leave from '../models/Leave.js';
import Payroll from '../models/Payroll.js';
import Employee from '../models/Employee.js';
import { NotFoundError } from '../utils/errors.js';

export const adminService = {
  // Employee Directory CRUD
  getAllEmployees: async (search = '', department = '') => {
    // Scaffold raw search queries for Developer C
    const query = `
      SELECT u.id as user_id, u.name, u.email, u.role, e.id as employee_id,
             e.phone, e.department, e.designation, e.joining_date, e.salary
      FROM users u
      LEFT JOIN employees e ON u.id = e.user_id
      WHERE u.role != 'admin'
        AND (u.name ILIKE $1 OR u.email ILIKE $1)
        AND (e.department ILIKE $2 OR $2 = '')
      ORDER BY u.name ASC;
    `;
    const { rows } = await pool.query(query, [`%${search}%`, department]);
    return rows;
  },

  // Leave Reviews
  approveLeave: async (leaveId) => {
    const leave = await Leave.updateStatus(leaveId, 'approved', 'Approved by administrator');
    if (!leave) throw new NotFoundError('Leave request not found');
    return leave;
  },

  rejectLeave: async (leaveId, comment) => {
    const leave = await Leave.updateStatus(leaveId, 'rejected', comment || 'Rejected by administrator');
    if (!leave) throw new NotFoundError('Leave request not found');
    return leave;
  },

  // Payroll Adjustments
  processMonthlyPayroll: async (employeeId, { bonus = 0, deductions = 0, month }) => {
    const query = 'SELECT salary FROM employees WHERE id = $1';
    const { rows } = await pool.query(query, [employeeId]);
    if (rows.length === 0) throw new NotFoundError('Employee not found');

    const basicSalary = parseFloat(rows[0].salary);
    const netSalary = basicSalary + parseFloat(bonus) - parseFloat(deductions);

    return Payroll.create({
      employeeId,
      basicSalary,
      bonus,
      deductions,
      netSalary,
      month
    });
  },

  // Reports Generation
  generateCompanyReports: async () => {
    // Generate company reports counts
    const empCountQuery = "SELECT COUNT(*) FROM users WHERE role = 'employee'";
    const { rows } = await pool.query(empCountQuery);
    return {
      totalEmployees: parseInt(rows[0].count),
    };
  }
};
// target: Developer C (Admin Modules & Reporting)
