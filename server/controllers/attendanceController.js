import { attendanceService } from '../services/attendanceService.js';

export const attendanceController = {
  checkIn: async (req, res, next) => {
    try {
      const { checkInTime } = req.body;
      const data = await attendanceService.checkIn(req.user.id, checkInTime || new Date());
      res.status(200).json({
        success: true,
        message: 'Checked in successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  checkOut: async (req, res, next) => {
    try {
      const { checkOutTime } = req.body;
      const data = await attendanceService.checkOut(req.user.id, checkOutTime || new Date());
      res.status(200).json({
        success: true,
        message: 'Checked out successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  getHistory: async (req, res, next) => {
    try {
      const { month } = req.query;
      const currentMonth = month || new Date().toISOString().substring(0, 7);
      const data = await attendanceService.getHistory(req.user.id, currentMonth);
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }
};
