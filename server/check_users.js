import pool from './config/db.js';

async function run() {
  try {
    const res = await pool.query(`
      SELECT id, employee_id, email, role_id, is_active 
      FROM users;
    `);
    console.log('Users in DB:');
    console.table(res.rows);
  } catch (err) {
    console.error('Query failed:', err);
  } finally {
    await pool.end();
  }
}

run();
