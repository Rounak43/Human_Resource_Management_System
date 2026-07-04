/**
 * Role Authorization Middleware Guard
 * 
 * Props:
 * - allowedRoles (string[]): List of permitted roles (e.g. ['admin', 'hr']).
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized: No active session' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden: Insufficient role permissions' });
    }

    next();
  };
};
