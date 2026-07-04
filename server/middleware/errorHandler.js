/**
 * Centralized Backend Global Error Handler Middleware
 * 
 * Responsibilities:
 * - Intercept exceptions thrown anywhere in the controllers/services.
 * - Log stack traces for diagnostic purposes in development.
 * - Format consistent JSON error response bodies with HTTP status codes.
 */
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[Error] ${req.method} ${req.url} - Status ${statusCode}:`, err.stack);

  res.status(statusCode).json({
    success: false,
    error: {
      status: statusCode,
      message,
      // Provide stack traces only in development
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    },
  });
};
