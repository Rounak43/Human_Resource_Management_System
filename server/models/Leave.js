import pool from '../config/db.js';

class Leave {
  static async create({ employeeId, leaveType, startDate, endDate, reason, attachmentUrl }) {
    // Calculate number of days
    const sDate = new Date(startDate);
    const eDate = new Date(endDate);
    const diffTime = Math.abs(eDate - sDate);
    const numberOfDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const query = `
      INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, number_of_days, reason, status, attachment_url)
      VALUES ($1, $2, $3, $4, $5, $6, 'Pending', $7)
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [employeeId, leaveType, startDate, endDate, numberOfDays, reason, attachmentUrl || null]);
    return rows[0];
  }

  static async findByEmployee(employeeId) {
    const query = `
      SELECT lr.*, e.full_name as approved_by_name
      FROM leave_requests lr
      LEFT JOIN employees e ON lr.approved_by = e.employee_id
      WHERE lr.employee_id = $1
      ORDER BY lr.start_date DESC;
    `;
    const { rows } = await pool.query(query, [employeeId]);
    return rows;
  }

  static async getAll() {
    const query = `
      SELECT lr.*, e.full_name, e.designation, d.department_name, app.full_name as approved_by_name
      FROM leave_requests lr
      LEFT JOIN employees e ON lr.employee_id = e.employee_id
      LEFT JOIN departments d ON e.department_id = d.department_id
      LEFT JOIN employees app ON lr.approved_by = app.employee_id
      ORDER BY lr.start_date DESC;
    `;
    const { rows } = await pool.query(query);
    return rows;
  }

  static async updateStatus(leaveId, { status, approvedBy, remarks }) {
    const query = `
      UPDATE leave_requests
      SET status = $1, 
          approved_by = $2, 
          approved_at = CURRENT_TIMESTAMP, 
          remarks = COALESCE($3, remarks)
      WHERE leave_id = $4
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [status, approvedBy, remarks, leaveId]);
    return rows[0];
  }
}

export default Leave;
