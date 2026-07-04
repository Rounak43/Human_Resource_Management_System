import pool from '../config/db.js';

class Employee {
  static async findByUserId(userId) {
    const query = `
      SELECT u.id as user_id, u.name, u.email, u.role, e.id as employee_id,
             e.phone, e.address, e.department, e.designation, e.joining_date, e.salary, e.profile_picture
      FROM users u
      LEFT JOIN employees e ON u.id = e.user_id
      WHERE u.id = $1;
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows[0];
  }

  static async createProfile(userId, { phone, address, department, designation, salary }) {
    const query = `
      INSERT INTO employees (user_id, phone, address, department, designation, salary)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [userId, phone, address, department, designation, salary]);
    return rows[0];
  }

  static async updateProfile(employeeId, { phone, address, profilePicture }) {
    const query = `
      UPDATE employees
      SET phone = COALESCE($1, phone),
          address = COALESCE($2, address),
          profile_picture = COALESCE($3, profile_picture),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [phone, address, profilePicture, employeeId]);
    return rows[0];
  }
}

export default Employee;
// target: Developer D
