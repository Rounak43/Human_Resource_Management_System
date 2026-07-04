import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.js';

/**
 * JWT Authentication Middleware
 * 
 * Responsibilities:
 * - Read 'Authorization' header for Bearer token.
 * - Verify the token signature using the JWT secret.
 * - Decode user identification details (id, role, email) and attach to req.user.
 */
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access Denied: No Token Provided' });
  }

  try {
    const decoded = jwt.verify(token, jwtConfig.secret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Invalid or Expired Token' });
  }
};
