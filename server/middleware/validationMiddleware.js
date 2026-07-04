import { validationResult } from 'express-validator';

/**
 * Express Validator Form Scaffolder Middleware
 * 
 * Responsibilities:
 * - Read validation results from request context.
 * - If errors are found, return status code 400 with detailed array of issues.
 */
export const validateFields = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};
