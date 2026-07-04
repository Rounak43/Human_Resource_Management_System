import pool from '../config/db.js';

class Leave {
  static async create({ employeeId, leaveType, startDate, endDate, remarks }) {
    const query = `
      INSERT INTO leave (employee_id, leave_type, start_date, end_date, remarks, status)
      VALUES ($1, $2, $3, $4, $5, 'pending')
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [employeeId, leaveType, startDate, endDate, remarks]);
    return rows[0];
  }

  static async findByEmployee(employeeId) {
    const query = 'SELECT * FROM leave WHERE employee_id = $1 ORDER BY start_date DESC';
    const { rows } = await pool.query(query, [employeeId]);
    return rows;
  }

  static async updateStatus(id, status, adminComment) {
    const query = `
      UPDATE leave
      SET status = $1, admin_comment = COALESCE($2, admin_comment)
      WHERE id = $3
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [status, adminComment, id]);
    return rows[0];
  }
}

export default Leave;
