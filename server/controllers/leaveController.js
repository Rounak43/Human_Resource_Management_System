import { leaveService } from '../services/leaveService.js';

export const leaveController = {
  applyLeave: async (req, res, next) => {
    try {
      const data = await leaveService.applyLeave(req.user.id, req.body);
      res.status(201).json({
        success: true,
        message: 'Leave applied successfully. Awaiting approval.',
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  getHistory: async (req, res, next) => {
    try {
      const data = await leaveService.getHistory(req.user.id);
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }
};
// target: Developer B
