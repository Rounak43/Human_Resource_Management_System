import pool from '../config/db.js';

class Payroll {
  static async create({ employeeId, basicSalary, bonus, deductions, netSalary, month }) {
    const query = `
      INSERT INTO payroll (employee_id, basic_salary, bonus, deductions, net_salary, month)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (employee_id, month) DO UPDATE
      SET basic_salary = EXCLUDED.basic_salary,
          bonus = EXCLUDED.bonus,
          deductions = EXCLUDED.deductions,
          net_salary = EXCLUDED.net_salary
      RETURNING *;
    `;
    const values = [employeeId, basicSalary, bonus, deductions, netSalary, month];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async findByEmployee(employeeId) {
    const query = 'SELECT * FROM payroll WHERE employee_id = $1 ORDER BY month DESC';
    const { rows } = await pool.query(query, [employeeId]);
    return rows;
  }
}

export default Payroll;
