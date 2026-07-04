import pool from './config/db.js';

async function run() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'employees'
      ORDER BY ordinal_position;
    `);
    console.log('Employees Columns:');
    console.table(res.rows);
  } catch (err) {
    console.error('Inspection failed:', err);
  } finally {
    await pool.end();
  }
}

run();
