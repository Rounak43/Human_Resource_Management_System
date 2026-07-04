import User from '../models/User.js';
import Employee from '../models/Employee.js';
import { comparePassword, hashPassword } from '../utils/helpers.js';
import { BadRequestError, UnauthorizedError } from '../utils/errors.js';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.js';
import pool from '../config/db.js';

async function generateEmployeeId(fullName, client) {
  const cleanName = fullName.replace(/[^a-zA-Z\s]/g, '').toUpperCase();
  const parts = cleanName.trim().split(/\s+/).filter(Boolean);
  
  let initials = '';
  if (parts.length >= 2) {
    initials = parts[0].substring(0, 2) + parts[parts.length - 1].substring(0, 2);
  } else if (parts.length === 1) {
    initials = parts[0].substring(0, 4);
  } else {
    initials = 'TEMP';
  }
  
  while (initials.length < 4) {
    initials += 'X';
  }

  const year = new Date().getFullYear();

  const { rows } = await client.query(
    `SELECT employee_id FROM employees WHERE employee_id LIKE $1`,
    [`OI%${year}%`]
  );

  let maxSeq = 0;
  for (const row of rows) {
    const id = row.employee_id;
    if (id.length >= 14) {
      const seqStr = id.substring(id.length - 4);
      const seq = parseInt(seqStr, 10);
      if (!isNaN(seq) && seq > maxSeq) {
        maxSeq = seq;
      }
    }
  }

  const nextSeq = maxSeq + 1;
  const nextSeqStr = String(nextSeq).padStart(4, '0');

  return `OI${initials}${year}${nextSeqStr}`;
}

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

      const employeeId = await generateEmployeeId(name, client);

      // 1. Create Employee Profile first
      const empQuery = `
        INSERT INTO employees (employee_id, full_name, phone, address, department_id, designation, salary)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING employee_id;
      `;
      const empRes = await client.query(empQuery, [employeeId, name, phone, address, department_id, designation, salary || 0.00]);

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
