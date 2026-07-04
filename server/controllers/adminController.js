import { adminService } from '../services/adminService.js';
import Leave from '../models/Leave.js';

export const adminController = {
  // Employee Management CRUD
  getAllEmployees: async (req, res, next) => {
    try {
      const { search, department } = req.query;
      const data = await adminService.getAllEmployees(search, department);
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  addEmployee: async (req, res, next) => {
    try {
      const data = await adminService.addEmployee(req.body);
      res.status(201).json({
        success: true,
        message: 'Employee profile and user login created successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  editEmployee: async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = await adminService.editEmployee(id, req.body);
      res.status(200).json({
        success: true,
        message: 'Employee updated successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  deleteEmployee: async (req, res, next) => {
    try {
      const { id } = req.params;
      await adminService.deleteEmployee(id);
      res.status(200).json({
        success: true,
        message: 'Employee deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // Attendance Supervision
  getAllAttendance: async (req, res, next) => {
    try {
      const { date, employeeId } = req.query;
      const data = await adminService.getAllAttendance(date, employeeId);
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  editAttendance: async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = await adminService.editAttendance(parseInt(id), req.body);
      res.status(200).json({
        success: true,
        message: 'Attendance record updated successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  // Leave Actions
  getLeaveRequests: async (req, res, next) => {
    try {
      const data = await Leave.getAll();
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  approveLeave: async (req, res, next) => {
    try {
      const { id } = req.params;
      const approvedBy = req.user.employee_id;
      const data = await adminService.approveLeave(parseInt(id), approvedBy);
      res.status(200).json({
        success: true,
        message: 'Leave approved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  rejectLeave: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { adminComment } = req.body;
      const approvedBy = req.user.employee_id;
      const data = await adminService.rejectLeave(parseInt(id), adminComment, approvedBy);
      res.status(200).json({
        success: true,
        message: 'Leave rejected successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  // Payroll Processing
  processPayroll: async (req, res, next) => {
    try {
      const { employeeId } = req.params;
      const { bonus, deductions, month, year } = req.body;
      const generatedBy = req.user.employee_id;
      const data = await adminService.processPayroll(employeeId, { 
        bonus, 
        deductions, 
        month, 
        year, 
        generatedBy 
      });
      res.status(200).json({
        success: true,
        message: 'Payroll processed successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  getPayrollRecords: async (req, res, next) => {
    try {
      const { month, year } = req.query;
      const data = await adminService.getPayrollRecords(month, year);
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  updateSalaryConfig: async (req, res, next) => {
    try {
      const { employeeId } = req.params;
      const data = await adminService.updateSalaryConfig(employeeId, req.body);
      res.status(200).json({
        success: true,
        message: 'Salary configuration updated successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  // Analytical Reports
  getReports: async (req, res, next) => {
    try {
      const data = await adminService.generateCompanyReports();
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }
};
