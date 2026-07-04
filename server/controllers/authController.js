import { authService } from '../services/authService.js';
import User from '../models/User.js';

/**
 * Authentication Route Controller
 */
export const authController = {
  login: async (req, res, next) => {
    try {
      const { email, loginId, password } = req.body;
      const data = await authService.login(loginId || email, password);
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  register: async (req, res, next) => {
    try {
      const data = await authService.register(req.body);
      res.status(201).json({
        success: true,
        message: 'Employee registered successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  getMe: async (req, res, next) => {
    try {
      const user = await User.findById(req.user.user_id || req.user.id);
      res.status(200).json({
        success: true,
        data: {
          id: user.id,
          employee_id: user.employee_id,
          email: user.email,
          role: user.role_name.toLowerCase(),
          name: user.full_name
        }
      });
    } catch (error) {
      next(error);
    }
  },

  logout: async (req, res, next) => {
    try {
      res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  forgotPassword: async (req, res, next) => {
    try {
      const { email } = req.body;
      res.status(200).json({
        success: true,
        message: 'Password reset link sent to email',
      });
    } catch (error) {
      next(error);
    }
  }
};
