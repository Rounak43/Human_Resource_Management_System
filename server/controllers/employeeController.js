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
  }
};
