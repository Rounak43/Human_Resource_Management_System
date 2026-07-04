import pool from './config/db.js';

async function run() {
  try {
    const res = await pool.query(`
      SELECT table_name, column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position;
    `);
    console.log('Columns across all tables:');
    console.table(res.rows);
  } catch (err) {
    console.error('Inspection failed:', err);
  } finally {
    await pool.end();
  }
}

run();
