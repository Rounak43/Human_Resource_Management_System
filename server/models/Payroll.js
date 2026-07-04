import pool from '../config/db.js';

class Payroll {
  static async create({ employeeId, month, year, basicSalary, bonus, deductions, netSalary, generatedBy }) {
    const query = `
      INSERT INTO payroll (employee_id, month, year, basic_salary, bonus, deductions, net_salary, generated_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT ON CONSTRAINT unique_employee_month_year DO UPDATE
      SET basic_salary = EXCLUDED.basic_salary,
          bonus = EXCLUDED.bonus,
          deductions = EXCLUDED.deductions,
          net_salary = EXCLUDED.net_salary,
          generated_by = EXCLUDED.generated_by,
          generated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;
    const values = [employeeId, month, year, basicSalary, bonus, deductions, netSalary, generatedBy];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async findByEmployee(employeeId) {
    const query = `
      SELECT p.*, e.full_name as generated_by_name
      FROM payroll p
      LEFT JOIN employees e ON p.generated_by = e.employee_id
      WHERE p.employee_id = $1
      ORDER BY p.year DESC, p.month DESC;
    `;
    const { rows } = await pool.query(query, [employeeId]);
    return rows;
  }

  static async getAll(month = '', year = null) {
    let query = `
      SELECT p.*, e.full_name, e.designation, d.department_name, gen.full_name as generated_by_name
      FROM payroll p
      LEFT JOIN employees e ON p.employee_id = e.employee_id
      LEFT JOIN departments d ON e.department_id = d.department_id
      LEFT JOIN employees gen ON p.generated_by = gen.employee_id
      WHERE 1=1
    `;
    const values = [];
    let paramIndex = 1;

    if (month) {
      query += ` AND p.month = $${paramIndex}`;
      values.push(month);
      paramIndex++;
    }

    if (year) {
      query += ` AND p.year = $${paramIndex}`;
      values.push(parseInt(year));
      paramIndex++;
    }

    query += ` ORDER BY p.year DESC, p.month DESC, p.payroll_id DESC`;
    const { rows } = await pool.query(query, values);
    return rows;
  }
}

export default Payroll;
