import User from '../models/User.js';
import Employee from '../models/Employee.js';
import { comparePassword, hashPassword } from '../utils/helpers.js';
import { BadRequestError, UnauthorizedError } from '../utils/errors.js';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.js';
import pool from '../config/db.js';

/**
 * Authentication Business Operations Service
 */
export const authService = {
  login: async (email, password) => {
    const user = await User.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Sign jwt token
    const token = jwt.sign(
      { 
        id: user.id, 
        name: user.full_name || user.email, 
        role: user.role_name.toLowerCase(), 
        email: user.email, 
        employee_id: user.employee_id 
      },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    return { 
      token, 
      user: { 
        id: user.id, 
        name: user.full_name || user.email, 
        role: user.role_name.toLowerCase(), 
        email: user.email, 
        employee_id: user.employee_id 
      } 
    };
  },

  register: async ({ name, email, password, role, phone, address, department_id, designation, salary }) => {
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new BadRequestError('Email already registered');
    }

    const hashedPassword = await hashPassword(password);
    
    // We execute inside a transaction client
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Create Employee Profile first
      const empQuery = `
        INSERT INTO employees (full_name, phone, address, department_id, designation, salary)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING employee_id;
      `;
      const empRes = await client.query(empQuery, [name, phone, address, department_id, designation, salary || 0.00]);
      const employeeId = empRes.rows[0].employee_id;

      // 2. Map role
      let roleId = 2; // Employee
      if (role && (role.toLowerCase() === 'admin' || role.toLowerCase() === 'hr')) {
        roleId = 1;
      }

      // 3. Create User
      const userQuery = `
        INSERT INTO users (employee_id, email, password_hash, role_id, is_active)
        VALUES ($1, $2, $3, $4, TRUE)
        RETURNING id;
      `;
      const userRes = await client.query(userQuery, [employeeId, email, hashedPassword, roleId]);
      const userId = userRes.rows[0].id;

      // 4. Backlink employee to user
      const updateEmpQuery = `
        UPDATE employees
        SET user_id = $1
        WHERE employee_id = $2;
      `;
      await client.query(updateEmpQuery, [userId, employeeId]);

      await client.query('COMMIT');

      // Fetch newly created details
      const userDetails = await User.findById(userId);
      const employeeDetails = await Employee.findById(employeeId);

      return { user: userDetails, employee: employeeDetails };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
};
