import pool from '../config/db.js';

/**
 * User Database Model Interface
 */
class User {
  static async findByEmail(email) {
    const query = `
      SELECT u.id, u.employee_id, u.email, u.password_hash, u.role_id, u.is_active, u.must_change_password, r.role_name, e.full_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN employees e ON u.employee_id = e.employee_id
      WHERE u.email = $1;
    `;
    const { rows } = await pool.query(query, [email]);
    return rows[0];
  }

  static async findByLoginId(loginId) {
    const query = `
      SELECT u.id, u.employee_id, u.email, u.password_hash, u.role_id, u.is_active, u.must_change_password, r.role_name, e.full_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN employees e ON u.employee_id = e.employee_id
      WHERE u.employee_id = $1 OR u.email = $1;
    `;
    const { rows } = await pool.query(query, [loginId]);
    return rows[0];
  }

  static async create({ email, password_hash, role_name, employee_id, must_change_password = true }) {
    let roleId = 2; // Default to Employee (2)
    if (role_name && (role_name.toLowerCase() === 'admin' || role_name.toLowerCase() === 'hr')) {
      roleId = 1;
    }

    const query = `
      INSERT INTO users (employee_id, email, password_hash, role_id, is_active, must_change_password)
      VALUES ($1, $2, $3, $4, TRUE, $5)
      RETURNING id, employee_id, email, role_id, created_at, must_change_password;
    `;
    const values = [employee_id, email, password_hash, roleId, must_change_password];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT u.id, u.employee_id, u.email, u.role_id, u.is_active, u.must_change_password, r.role_name, e.full_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN employees e ON u.employee_id = e.employee_id
      WHERE u.id = $1;
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  static async updatePassword(id, passwordHash) {
    const query = `
      UPDATE users
      SET password_hash = $1, must_change_password = FALSE, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, email, must_change_password;
    `;
    const { rows } = await pool.query(query, [passwordHash, id]);
    return rows[0];
  }
}

export default User;
