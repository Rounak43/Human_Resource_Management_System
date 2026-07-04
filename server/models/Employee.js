import pool from '../config/db.js';

class Employee {
  static async findByUserId(userId) {
    const query = `
      SELECT e.employee_id, e.user_id, e.full_name, e.phone, e.address, 
             e.department_id, e.designation, e.joining_date, e.salary, e.profile_image,
             d.department_name, u.email, r.role_name
      FROM employees e
      LEFT JOIN users u ON e.user_id = u.id
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN departments d ON e.department_id = d.department_id
      WHERE e.user_id = $1;
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows[0];
  }

  static async findById(employeeId) {
    const query = `
      SELECT e.employee_id, e.user_id, e.full_name, e.phone, e.address, 
             e.department_id, e.designation, e.joining_date, e.salary, e.profile_image,
             d.department_name, u.email
      FROM employees e
      LEFT JOIN users u ON e.user_id = u.id
      LEFT JOIN departments d ON e.department_id = d.department_id
      WHERE e.employee_id = $1;
    `;
    const { rows } = await pool.query(query, [employeeId]);
    return rows[0];
  }

  static async create({ user_id, full_name, phone, address, department_id, designation, salary, profile_image }) {
    const query = `
      INSERT INTO employees (user_id, full_name, phone, address, department_id, designation, salary, profile_image)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const values = [user_id, full_name, phone, address, department_id, designation, salary || 0.00, profile_image];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async update(employeeId, { full_name, phone, address, department_id, designation, salary, profile_image }) {
    const query = `
      UPDATE employees
      SET full_name = COALESCE($1, full_name),
          phone = COALESCE($2, phone),
          address = COALESCE($3, address),
          department_id = COALESCE($4, department_id),
          designation = COALESCE($5, designation),
          salary = COALESCE($6, salary),
          profile_image = COALESCE($7, profile_image)
      WHERE employee_id = $8
      RETURNING *;
    `;
    const values = [full_name, phone, address, department_id, designation, salary, profile_image, employeeId];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async delete(employeeId) {
    // Delete user too
    const selectQuery = `SELECT user_id FROM employees WHERE employee_id = $1`;
    const selectRes = await pool.query(selectQuery, [employeeId]);
    const userId = selectRes.rows[0]?.user_id;

    if (userId) {
      await pool.query(`DELETE FROM users WHERE id = $1`, [userId]);
    } else {
      await pool.query(`DELETE FROM employees WHERE employee_id = $1`, [employeeId]);
    }
    return true;
  }

  static async getAll({ search = '', department_id = '' }) {
    let query = `
      SELECT e.employee_id, e.user_id, e.full_name, e.phone, e.address, 
             e.department_id, e.designation, e.joining_date, e.salary, e.profile_image,
             d.department_name, u.email, u.is_active
      FROM employees e
      LEFT JOIN users u ON e.user_id = u.id
      LEFT JOIN departments d ON e.department_id = d.department_id
      WHERE 1=1
    `;
    const values = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND (e.full_name ILIKE $${paramIndex} OR e.designation ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`;
      values.push(`%${search}%`);
      paramIndex++;
    }

    if (department_id) {
      query += ` AND e.department_id = $${paramIndex}`;
      values.push(parseInt(department_id));
      paramIndex++;
    }

    query += ` ORDER BY e.employee_id ASC`;
    const { rows } = await pool.query(query, values);
    return rows;
  }
}

export default Employee;
