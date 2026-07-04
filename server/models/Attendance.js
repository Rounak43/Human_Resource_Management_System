import pool from '../config/db.js';

class Attendance {
  static async checkIn(employeeId, checkInTime) {
    const checkInDate = new Date(checkInTime);
    // Standard start time: 09:00 AM
    const standardStart = new Date(checkInDate);
    standardStart.setHours(9, 0, 0, 0);

    let lateMinutes = 0;
    if (checkInDate > standardStart) {
      lateMinutes = Math.round((checkInDate - standardStart) / (1000 * 60));
    }

    const query = `
      INSERT INTO attendance (employee_id, attendance_date, check_in_time, attendance_status, late_minutes, remarks)
      VALUES ($1, CURRENT_DATE, $2, 'Present', $3, 'Checked in')
      ON CONFLICT (employee_id, attendance_date) DO UPDATE
      SET check_in_time = EXCLUDED.check_in_time,
          attendance_status = 'Present',
          late_minutes = EXCLUDED.late_minutes,
          updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [employeeId, checkInTime, lateMinutes]);
    return rows[0];
  }

  static async checkOut(employeeId, checkOutTime) {
    // Retrieve check_in_time first to compute hours
    const findQuery = `
      SELECT check_in_time FROM attendance 
      WHERE employee_id = $1 AND attendance_date = CURRENT_DATE
    `;
    const findRes = await pool.query(findQuery, [employeeId]);
    if (findRes.rows.length === 0) {
      throw new Error("No check-in record found for today.");
    }

    const checkInTime = findRes.rows[0].check_in_time;
    let workingHours = 0.00;
    let overtimeHours = 0.00;

    if (checkInTime) {
      const inTime = new Date(checkInTime);
      const outTime = new Date(checkOutTime);
      const diffMs = outTime - inTime;
      workingHours = Math.max(0, parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2)));
      if (workingHours > 8.00) {
        overtimeHours = parseFloat((workingHours - 8.00).toFixed(2));
      }
    }

    // Standard checkout: 05:00 PM
    const outDate = new Date(checkOutTime);
    const standardEnd = new Date(outDate);
    standardEnd.setHours(17, 0, 0, 0);
    let earlyLeaveMinutes = 0;
    if (outDate < standardEnd) {
      earlyLeaveMinutes = Math.round((standardEnd - outDate) / (1000 * 60));
    }

    const query = `
      UPDATE attendance
      SET check_out_time = $1,
          working_hours = $2,
          overtime_hours = $3,
          early_leave_minutes = $4,
          updated_at = CURRENT_TIMESTAMP
      WHERE employee_id = $5 AND attendance_date = CURRENT_DATE
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [checkOutTime, workingHours, overtimeHours, earlyLeaveMinutes, employeeId]);
    return rows[0];
  }

  static async getHistory(employeeId, month = '') {
    let query = `
      SELECT * FROM attendance
      WHERE employee_id = $1
    `;
    const values = [employeeId];

    if (month) {
      query += ` AND TO_CHAR(attendance_date, 'YYYY-MM') = $2`;
      values.push(month);
    }

    query += ` ORDER BY attendance_date DESC;`;
    const { rows } = await pool.query(query, values);
    return rows;
  }

  static async getAll({ date = '', employeeId = '' }) {
    let query = `
      SELECT a.*, e.full_name, e.designation, d.department_name
      FROM attendance a
      LEFT JOIN employees e ON a.employee_id = e.employee_id
      LEFT JOIN departments d ON e.department_id = d.department_id
      WHERE 1=1
    `;
    const values = [];
    let paramIndex = 1;

    if (date) {
      query += ` AND a.attendance_date = $${paramIndex}`;
      values.push(date);
      paramIndex++;
    }

    if (employeeId) {
      query += ` AND a.employee_id = $${paramIndex}`;
      values.push(employeeId);
      paramIndex++;
    }

    query += ` ORDER BY a.attendance_date DESC, a.attendance_id DESC`;
    const { rows } = await pool.query(query, values);
    return rows;
  }

  static async update(attendanceId, { check_in_time, check_out_time, attendance_status, remarks }) {
    // Recompute hours if times are edited
    let workingHours = 0.00;
    let overtimeHours = 0.00;

    if (check_in_time && check_out_time) {
      const inTime = new Date(check_in_time);
      const outTime = new Date(check_out_time);
      const diffMs = outTime - inTime;
      workingHours = Math.max(0, parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2)));
      if (workingHours > 8.00) {
        overtimeHours = parseFloat((workingHours - 8.00).toFixed(2));
      }
    }

    const query = `
      UPDATE attendance
      SET check_in_time = COALESCE($1, check_in_time),
          check_out_time = COALESCE($2, check_out_time),
          working_hours = $3,
          overtime_hours = $4,
          attendance_status = COALESCE($5, attendance_status),
          remarks = COALESCE($6, remarks),
          updated_at = CURRENT_TIMESTAMP
      WHERE attendance_id = $7
      RETURNING *;
    `;
    const values = [check_in_time, check_out_time, workingHours, overtimeHours, attendance_status, remarks, attendanceId];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }
}

export default Attendance;
