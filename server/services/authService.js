import User from '../models/User.js';
import Employee from '../models/Employee.js';
import { comparePassword, hashPassword } from '../utils/helpers.js';
import { BadRequestError, UnauthorizedError } from '../utils/errors.js';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.js';
import pool from '../config/db.js';
import { generateEmployeeId } from '../utils/employeeIdGenerator.js';

/**
 * Authentication Business Operations Service
 */
export const authService = {
  login: async (loginId, password) => {
    if (!loginId || !password) {
      throw new BadRequestError('Required fields: loginId and password');
    }

    // Allow logging in via Employee ID or email address
    const user = await User.findByLoginId(loginId);
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
        user_id: user.id,
        employee_id: user.employee_id,
        id: user.id, // maps req.user.id to user_id
        role: user.role_name.toLowerCase(), 
        email: user.email 
      },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    const employeeDetails = await Employee.findById(user.employee_id);

    return { 
      token, 
      role: user.role_name.toLowerCase(),
      user: { 
        id: user.id, 
        user_id: user.id,
        employee_id: user.employee_id,
        email: user.email,
        role: user.role_name.toLowerCase(), 
        name: user.full_name,
        must_change_password: user.must_change_password
      },
      employee: employeeDetails
    };
  },

  register: async (data) => {
    const { name, email, password, companyName, companyLogo, phone, address, designation } = data;
    
    // 1. Check if public registration is already disabled (any users exist)
    const userCountRes = await pool.query('SELECT COUNT(*)::int as count FROM users');
    if (userCountRes.rows[0].count > 0) {
      throw new BadRequestError('Public registration is disabled. Please contact your administrator.');
    }

    if (!name || !email || !password || !companyName) {
      throw new BadRequestError('Required fields: name, email, password, and companyName');
    }

    const hashedPassword = await hashPassword(password);
    
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 2. Create Company
      const compRes = await client.query(
        `INSERT INTO companies (company_name, company_logo) VALUES ($1, $2) RETURNING company_id`,
        [companyName, companyLogo || null]
      );
      const companyId = compRes.rows[0].company_id;

      // 3. Create Default Department
      const deptRes = await client.query(
        `INSERT INTO departments (department_name) VALUES ('Administration') RETURNING department_id`
      );
      const departmentId = deptRes.rows[0].department_id;

      // 4. Generate Employee ID for the first Admin
      const nameParts = name.trim().split(/\s+/);
      const firstName = nameParts[0] || 'Admin';
      const lastName = nameParts.slice(1).join(' ') || 'User';

      const employeeId = await generateEmployeeId(client, {
        companyName,
        firstName,
        lastName,
        joiningDate: new Date()
      });

      // 5. Create Admin Employee Record
      const empQuery = `
        INSERT INTO employees (employee_id, full_name, phone, address, department_id, designation, joining_date, salary, company_name, company_id)
        VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE, 0.00, $7, $8)
        RETURNING *;
      `;
      await client.query(empQuery, [
        employeeId,
        name,
        phone || null,
        address || null,
        departmentId,
        designation || 'CEO/Founder',
        companyName,
        companyId
      ]);

      // 6. Create Admin User login (must_change_password = false since they set it themselves)
      const userQuery = `
        INSERT INTO users (employee_id, email, password_hash, role_id, is_active, must_change_password)
        VALUES ($1, $2, $3, 1, TRUE, FALSE)
        RETURNING id;
      `;
      const userRes = await client.query(userQuery, [employeeId, email, hashedPassword]);
      const userId = userRes.rows[0].id;

      // 7. Update Employee and Department backlink managers
      await client.query('UPDATE employees SET user_id = $1 WHERE employee_id = $2', [userId, employeeId]);
      await client.query('UPDATE departments SET manager_id = $1 WHERE department_id = $2', [employeeId, departmentId]);

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
