import pool from '../config/db.js';

class Attendance {
  static async checkIn(employeeId, date, time) {
    // Construct check_in_time timestamp
    const checkInTime = new Date(`${date}T${time}`);
    
    // Standard start time is 09:00 AM on that day
    const standardStart = new Date(`${date}T09:00:00`);
    
    let lateMinutes = 0;
    if (checkInTime > standardStart) {
      lateMinutes = Math.round((checkInTime - standardStart) / (1000 * 60));
    }

    // Determine status (Present by default, or Half Day if late by > 120 minutes)
    let status = 'Present';
    if (lateMinutes > 120) {
      status = 'Half Day';
    }

    const query = `
      INSERT INTO attendance (employee_id, attendance_date, check_in_time, attendance_status, late_minutes, remarks)
      VALUES ($1, $2, $3, $4, $5, 'Checked in')
      ON CONFLICT (employee_id, attendance_date) DO UPDATE
      SET check_in_time = COALESCE(attendance.check_in_time, EXCLUDED.check_in_time),
          attendance_status = EXCLUDED.attendance_status,
          late_minutes = EXCLUDED.late_minutes,
          remarks = EXCLUDED.remarks,
          updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [employeeId, date, checkInTime, status, lateMinutes]);
    return rows[0];
  }

  static async checkOut(employeeId, date, time) {
    const checkOutTime = new Date(`${date}T${time}`);
    
    // Fetch existing check_in_time
    const findQuery = `
      SELECT check_in_time FROM attendance 
      WHERE employee_id = $1 AND attendance_date = $2
    `;
    const findRes = await pool.query(findQuery, [employeeId, date]);
    if (findRes.rows.length === 0) {
      throw new Error("No check-in record found for this date. Please check in first.");
    }

    const checkInTime = findRes.rows[0].check_in_time;
    let workingHours = 0.00;
    let overtimeHours = 0.00;

    if (checkInTime) {
      const inTime = new Date(checkInTime);
      const diffMs = checkOutTime - inTime;
      workingHours = Math.max(0, parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2)));
      if (workingHours > 8.00) {
        overtimeHours = parseFloat((workingHours - 8.00).toFixed(2));
      }
    }

    // Standard checkout is 05:00 PM on that day
    const standardEnd = new Date(`${date}T17:00:00`);
    let earlyLeaveMinutes = 0;
    if (checkOutTime < standardEnd) {
      earlyLeaveMinutes = Math.round((standardEnd - checkOutTime) / (1000 * 60));
    }

    // Update status if working hours are low
    let status = 'Present';
    if (workingHours > 0 && workingHours < 4.00) {
      status = 'Half Day';
    }

    const query = `
      UPDATE attendance
      SET check_out_time = $1,
          working_hours = $2,
          overtime_hours = $3,
          early_leave_minutes = $4,
          attendance_status = CASE 
            WHEN attendance_status = 'Half Day' THEN 'Half Day'
            ELSE $5
          END,
          updated_at = CURRENT_TIMESTAMP
      WHERE employee_id = $6 AND attendance_date = $7
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [checkOutTime, workingHours, overtimeHours, earlyLeaveMinutes, status, employeeId, date]);
    return rows[0];
  }

  static async getByEmployeeAndDate(employeeId, date) {
    const query = 'SELECT * FROM attendance WHERE employee_id = $1 AND attendance_date = $2';
    const { rows } = await pool.query(query, [employeeId, date]);
    return rows[0];
  }

  static async getByEmployeeRange(employeeId, startDate, endDate) {
    const query = `
      SELECT * FROM attendance
      WHERE employee_id = $1 AND attendance_date BETWEEN $2 AND $3
      ORDER BY attendance_date ASC
    `;
    const { rows } = await pool.query(query, [employeeId, startDate, endDate]);
    return rows;
  }

  static async getMonthlySummary(employeeId, year, month) {
    const query = `
      SELECT 
        COUNT(*) FILTER (WHERE attendance_status = 'Present') as present_count,
        COUNT(*) FILTER (WHERE attendance_status = 'Absent') as absent_count,
        COUNT(*) FILTER (WHERE attendance_status = 'Leave') as leave_count,
        COUNT(*) FILTER (WHERE attendance_status = 'Half Day') as half_day_count,
        COUNT(*) FILTER (WHERE late_minutes > 0) as late_count,
        COALESCE(SUM(working_hours), 0)::float as total_working_hours,
        COALESCE(SUM(overtime_hours), 0)::float as total_overtime_hours
      FROM attendance
      WHERE employee_id = $1 
        AND EXTRACT(YEAR FROM attendance_date) = $2
        AND EXTRACT(MONTH FROM attendance_date) = $3;
    `;
    const { rows } = await pool.query(query, [employeeId, year, month]);
    return rows[0];
  }

  static async getAllByDate(date) {
    const query = `
      SELECT a.*, e.full_name, e.designation, d.department_name, e.department_id
      FROM attendance a
      LEFT JOIN employees e ON a.employee_id = e.employee_id
      LEFT JOIN departments d ON e.department_id = d.department_id
      WHERE a.attendance_date = $1
      ORDER BY e.full_name ASC;
    `;
    const { rows } = await pool.query(query, [date]);
    return rows;
  }

  static async getAllByRange(startDate, endDate, employeeId = null) {
    let query = `
      SELECT a.*, e.full_name, e.designation, d.department_name, e.department_id
      FROM attendance a
      LEFT JOIN employees e ON a.employee_id = e.employee_id
      LEFT JOIN departments d ON e.department_id = d.department_id
      WHERE a.attendance_date BETWEEN $1 AND $2
    `;
    const values = [startDate, endDate];

    if (employeeId) {
      query += ` AND a.employee_id = $3`;
      values.push(employeeId);
    }

    query += ` ORDER BY a.attendance_date DESC, e.full_name ASC`;
    const { rows } = await pool.query(query, values);
    return rows;
  }

  static async getAll({ date = '', employeeId = '' }) {
    let query = `
      SELECT a.*, e.full_name, e.designation, d.department_name, e.department_id
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

  static async upsertManual(employeeId, date, data) {
    const check_in_time = data.check_in_time ? new Date(data.check_in_time) : null;
    const check_out_time = data.check_out_time ? new Date(data.check_out_time) : null;
    
    let workingHours = 0.00;
    let overtimeHours = 0.00;

    if (check_in_time && check_out_time) {
      const diffMs = check_out_time - check_in_time;
      workingHours = Math.max(0, parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2)));
      if (workingHours > 8.00) {
        overtimeHours = parseFloat((workingHours - 8.00).toFixed(2));
      }
    }

    const late_minutes = parseInt(data.late_minutes || 0);
    const early_leave_minutes = parseInt(data.early_leave_minutes || 0);
    const attendance_status = data.attendance_status || 'Present';
    const remarks = data.remarks || 'Manual adjustment';

    const query = `
      INSERT INTO attendance (
        employee_id, attendance_date, check_in_time, check_out_time, 
        working_hours, overtime_hours, attendance_status, 
        late_minutes, early_leave_minutes, remarks
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (employee_id, attendance_date) DO UPDATE
      SET check_in_time = EXCLUDED.check_in_time,
          check_out_time = EXCLUDED.check_out_time,
          working_hours = EXCLUDED.working_hours,
          overtime_hours = EXCLUDED.overtime_hours,
          attendance_status = EXCLUDED.attendance_status,
          late_minutes = EXCLUDED.late_minutes,
          early_leave_minutes = EXCLUDED.early_leave_minutes,
          remarks = EXCLUDED.remarks,
          updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;
    const values = [
      employeeId, date, check_in_time, check_out_time, 
      workingHours, overtimeHours, attendance_status, 
      late_minutes, early_leave_minutes, remarks
    ];
    
    const { rows } = await pool.query(query, values);
    return rows[0];
  }
}

export default Attendance;
