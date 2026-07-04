import { adminService } from '../services/adminService.js';

export const adminController = {
  // Employee Management
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

  // Leave Actions
  approveLeave: async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = await adminService.approveLeave(id);
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
      const data = await adminService.rejectLeave(id, adminComment);
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
      const { bonus, deductions, month } = req.body;
      const data = await adminService.processPayroll(employeeId, { bonus, deductions, month });
      res.status(200).json({
        success: true,
        message: 'Payroll processed successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  // Reports
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
