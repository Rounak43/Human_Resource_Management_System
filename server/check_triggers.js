import pool from './config/db.js';

async function run() {
  try {
    const res = await pool.query(`
      SELECT trigger_name, event_manipulation, action_statement, action_timing 
      FROM information_schema.triggers 
      WHERE event_object_table = 'employees';
    `);
    console.log('Triggers on employees table:');
    console.table(res.rows);

    const functionsRes = await pool.query(`
      SELECT routine_name, routine_definition 
      FROM information_schema.routines 
      WHERE routine_type = 'FUNCTION' AND routine_schema = 'public';
    `);
    console.log('Database functions:');
    console.table(functionsRes.rows);
  } catch (err) {
    console.error('Trigger query failed:', err);
  } finally {
    await pool.end();
  }
}

run();
