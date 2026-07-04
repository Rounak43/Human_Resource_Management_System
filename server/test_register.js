import { authService } from './services/authService.js';
import pool from './config/db.js';

async function run() {
  try {
    console.log('Testing employee registration flow...');
    const res = await authService.register({
      name: 'Test Employee Name',
      email: 'test_emp_' + Date.now() + '@hrms.com',
      password: 'password123',
      role: 'Employee',
      phone: '555-9999',
      address: 'Test Address 123',
      department_id: 1,
      designation: 'Test Specialist',
      salary: 50000
    });
    console.log('Success! Result:', res);
  } catch (err) {
    console.error('Registration failed with error:', err);
  } finally {
    await pool.end();
  }
}

run();
