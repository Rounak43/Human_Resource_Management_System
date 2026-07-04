import pool from '../config/db.js';

class Notification {
  static async create({ employeeId, title, message, type }) {
    const query = `
      INSERT INTO notifications (employee_id, title, message, type, is_read)
      VALUES ($1, $2, $3, $4, FALSE)
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [employeeId, title, message, type]);
    return rows[0];
  }

  static async findByEmployee(employeeId) {
    const query = `
      SELECT * FROM notifications
      WHERE employee_id = $1 OR employee_id IS NULL
      ORDER BY created_at DESC;
    `;
    const { rows } = await pool.query(query, [employeeId]);
    return rows;
  }

  static async markAsRead(notificationId) {
    const query = `
      UPDATE notifications
      SET is_read = TRUE
      WHERE notification_id = $1
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [notificationId]);
    return rows[0];
  }

  static async markAllAsRead(employeeId) {
    const query = `
      UPDATE notifications
      SET is_read = TRUE
      WHERE employee_id = $1
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [employeeId]);
    return rows;
  }
}

export default Notification;
