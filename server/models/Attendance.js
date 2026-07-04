import pool from '../config/db.js';

class Attendance {
  static async checkIn(employeeId, checkInTime, status) {
    const query = `
      INSERT INTO attendance (employee_id, date, check_in, status)
      VALUES ($1, CURRENT_DATE, $2, $3)
      ON CONFLICT (employee_id, date) DO UPDATE 
      SET check_in = EXCLUDED.check_in, status = EXCLUDED.status
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [employeeId, checkInTime, status]);
    return rows[0];
  }

  static async checkOut(employeeId, checkOutTime) {
    const query = `
      UPDATE attendance
      SET check_out = $1
      WHERE employee_id = $2 AND date = CURRENT_DATE
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [checkOutTime, employeeId]);
    return rows[0];
  }

  static async getHistory(employeeId, month) {
    const query = `
      SELECT * FROM attendance
      WHERE employee_id = $1 AND TO_CHAR(date, 'YYYY-MM') = $2
      ORDER BY date DESC;
    `;
    const { rows } = await pool.query(query, [employeeId, month]);
    return rows;
  }
}

export default Attendance;
