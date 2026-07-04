import pool from '../config/db.js';

/**
 * User Database Model Interface
 * 
 * Responsibilities:
 * - Query users table for authentication logic.
 * - Execute raw parametrized SQL statements to prevent SQL injections.
 * 
 * Target: Developer D (Database & Models)
 */
class User {
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const { rows } = await pool.query(query, [email]);
    return rows[0];
  }

  static async create({ name, email, hashedPassword, role }) {
    const query = `
      INSERT INTO users (name, email, password, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, role, created_at;
    `;
    const values = [name, email, hashedPassword, role || 'employee'];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async findById(id) {
    const query = 'SELECT id, name, email, role, created_at FROM users WHERE id = $1';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }
}

export default User;
