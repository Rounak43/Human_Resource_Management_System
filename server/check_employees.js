import pool from './config/db.js';

async function run() {
  try {
    const res = await pool.query(`
      SELECT employee_id, user_id, full_name, joining_date, designation, salary 
      FROM employees
      ORDER BY employee_id;
    `);
    console.log('Employees in DB:');
    console.table(res.rows);
  } catch (err) {
    console.error('Query failed:', err);
  } finally {
    await pool.end();
  }
}

run();
