import pool from './config/db.js';

async function run() {
  try {
    const res = await pool.query(`
      SELECT 
        pg_get_expr(adbin, adrelid) as default_val,
        attname as column_name
      FROM pg_attrdef 
      JOIN pg_attribute ON attrelid = adrelid AND attnum = adnum
      WHERE adrelid = 'employees'::regclass;
    `);
    console.log('Column Defaults from pg_attrdef:');
    console.table(res.rows);
  } catch (err) {
    console.error('DDL query failed:', err);
  } finally {
    await pool.end();
  }
}

run();
