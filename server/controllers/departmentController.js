import Department from '../models/Department.js';

export const departmentController = {
  getAll: async (req, res, next) => {
    try {
      const data = await Department.getAll();
      res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  },

  create: async (req, res, next) => {
    try {
      const data = await Department.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Department created successfully',
        data
      });
    } catch (error) {
      next(error);
    }
  }
};
