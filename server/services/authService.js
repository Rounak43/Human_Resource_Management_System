import User from '../models/User.js';
import Employee from '../models/Employee.js';
import { comparePassword, hashPassword } from '../utils/helpers.js';
import { BadRequestError, UnauthorizedError } from '../utils/errors.js';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.js';

/**
 * Authentication Business Operations Service
 * 
 * Responsibilities:
 * - Validate credentials (email match, password verification).
 * - Generate signed JWT authentication tokens.
 * - Manage user registration and profile initialization transactions.
 */
export const authService = {
  login: async (email, password) => {
    const user = await User.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Sign jwt token
    const token = jwt.sign(
      { id: user.id, name: user.name, role: user.role, email: user.email },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    return { token, user: { id: user.id, name: user.name, role: user.role, email: user.email } };
  },

  register: async ({ name, email, password, role, ...profileDetails }) => {
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new BadRequestError('Email already registered');
    }

    const hashedPassword = await hashPassword(password);
    
    // DB transaction: Create user then initialize profile
    const user = await User.create({ name, email, hashedPassword, role });
    const profile = await Employee.createProfile(user.id, profileDetails);

    return { user, profile };
  }
};
