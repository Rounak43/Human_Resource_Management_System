import pool from './config/db.js';

async function run() {
  try {
    const triggers = await pool.query(`
      SELECT tgname, tgrelid::regclass as table_name, tgtype 
      FROM pg_trigger 
      WHERE NOT tgisinternal;
    `);
    console.log('Triggers:');
    console.table(triggers.rows);

    const procs = await pool.query(`
      SELECT proname, prosrc 
      FROM pg_proc 
      JOIN pg_namespace n ON n.oid = pronamespace 
      WHERE n.nspname = 'public';
    `);
    console.log('Functions:');
    console.table(procs.rows);
  } catch (err) {
    console.error('Catalog query failed:', err);
  } finally {
    await pool.end();
  }
}

run();
