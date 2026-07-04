import Notification from '../models/Notification.js';
import Employee from '../models/Employee.js';

export const notificationController = {
  getMyNotifications: async (req, res, next) => {
    try {
      const employee = await Employee.findByUserId(req.user.id);
      if (!employee) {
        return res.status(200).json({ success: true, data: [] });
      }

      const data = await Notification.findByEmployee(employee.employee_id);
      res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  },

  markAsRead: async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = await Notification.markAsRead(parseInt(id));
      res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  },

  markAllAsRead: async (req, res, next) => {
    try {
      const employee = await Employee.findByUserId(req.user.id);
      if (!employee) {
        return res.status(404).json({ success: false, message: 'Employee profile not found' });
      }

      await Notification.markAllAsRead(employee.employee_id);
      res.status(200).json({
        success: true,
        message: 'All notifications marked as read'
      });
    } catch (error) {
      next(error);
    }
  }
};
