import { authService } from '../services/authService.js';

/**
 * Authentication Route Controller
 * 
 * Responsibilities:
 * - Unwrap HTTP request bodies (email, password).
 * - Invoke authService methods (login, register).
 * - Format JSON response bodies with status codes.
 */
export const authController = {
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const data = await authService.login(email, password);
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

  forgotPassword: async (req, res, next) => {
    try {
      const { email } = req.body;
      // Trigger token email process (scaffolded)
      res.status(200).json({
        success: true,
        message: 'Password reset link sent to email',
      });
    } catch (error) {
      next(error);
    }
  }
};
