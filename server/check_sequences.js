import pool from './config/db.js';

async function run() {
  try {
    const res = await pool.query(`
      SELECT sequence_name 
      FROM information_schema.sequences;
    `);
    console.log('Database Sequences:');
    console.table(res.rows);
  } catch (err) {
    console.error('Sequence query failed:', err);
  } finally {
    await pool.end();
  }
}

run();
