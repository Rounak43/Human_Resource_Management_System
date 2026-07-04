import pool from '../config/db.js';

class Department {
  static async getAll() {
    const query = `
      SELECT d.department_id, d.department_name, d.manager_id, e.full_name as manager_name
      FROM departments d
      LEFT JOIN employees e ON d.manager_id = e.employee_id
      ORDER BY d.department_name ASC;
    `;
    const { rows } = await pool.query(query);
    return rows;
  }

  static async findById(id) {
    const query = `SELECT * FROM departments WHERE department_id = $1`;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  static async create({ department_name, manager_id }) {
    const query = `
      INSERT INTO departments (department_name, manager_id)
      VALUES ($1, $2)
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [department_name, manager_id]);
    return rows[0];
  }
}

export default Department;
