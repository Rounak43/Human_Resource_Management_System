import pool from './config/db.js';

async function run() {
  try {
    const res = await pool.query(`
      SELECT nspname FROM pg_namespace;
    `);
    console.log('Schemas in DB:');
    console.table(res.rows);
  } catch (err) {
    console.error('Query failed:', err);
  } finally {
    await pool.end();
  }
}

run();
