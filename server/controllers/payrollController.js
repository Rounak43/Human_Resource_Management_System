import { payrollService } from '../services/payrollService.js';

export const payrollController = {
  getSalaryStatements: async (req, res, next) => {
    try {
      const data = await payrollService.getSalaryStatements(req.user.id);
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }
};
