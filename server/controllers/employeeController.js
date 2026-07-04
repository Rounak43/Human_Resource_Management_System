import { employeeService } from '../services/employeeService.js';

export const employeeController = {
  getProfile: async (req, res, next) => {
    try {
      const data = await employeeService.getProfile(req.user.id);
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  updateProfile: async (req, res, next) => {
    try {
      const data = await employeeService.updateProfile(req.user.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  // ----- Administrative CRUD Controllers -----
  createEmployee: async (req, res, next) => {
    try {
      const data = await employeeService.createEmployee(req.body);
      res.status(201).json({
        success: true,
        message: 'Employee account created successfully.',
        data: {
          employeeId: data.employeeId,
          temporaryPassword: data.temporaryPassword,
          employee: data.employee
        }
      });
    } catch (error) {
      next(error);
    }
  },

  getAllEmployees: async (req, res, next) => {
    try {
      const { search, department } = req.query;
      const data = await employeeService.getAllEmployees(search, department);

      // Strip sensitive details (salary) if not Admin/HR
      const requestorRole = req.user?.role;
      if (requestorRole !== 'admin' && requestorRole !== 'hr') {
        data.forEach(emp => {
          delete emp.salary;
        });
      }

      res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  },

  getEmployeeById: async (req, res, next) => {
    try {
      const { employeeId } = req.params;
      const data = await employeeService.getEmployeeById(employeeId);

      // Strip salary if requestor is not Admin/HR and not self
      const requestorRole = req.user?.role;
      const requestorEmpId = req.user?.employee_id;
      if (requestorRole !== 'admin' && requestorRole !== 'hr' && requestorEmpId !== employeeId) {
        if (data) {
          delete data.salary;
          delete data.bank_details;
          delete data.ifsc;
          delete data.pan;
          delete data.uan;
        }
      }

      res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  },

  updateEmployee: async (req, res, next) => {
    try {
      const { employeeId } = req.params;
      const data = await employeeService.updateEmployee(employeeId, req.body);
      res.status(200).json({
        success: true,
        message: 'Employee updated successfully',
        data
      });
    } catch (error) {
      next(error);
    }
  },

  deleteEmployee: async (req, res, next) => {
    try {
      const { employeeId } = req.params;
      await employeeService.deleteEmployee(employeeId);
      res.status(200).json({
        success: true,
        message: 'Employee deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
};
export default employeeController;
