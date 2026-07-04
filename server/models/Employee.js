import pool from '../config/db.js';

class Employee {
  static async findByUserId(userId) {
    const query = `
      SELECT e.employee_id, e.user_id, e.full_name, e.phone, e.address, 
             e.department_id, e.designation, e.joining_date, e.salary, e.profile_image, e.company_name,
             e.dob, e.gender, e.nationality, e.personal_email, e.bank_name, e.bank_account_no, e.ifsc, e.pan, e.uan, e.emergency_contact,
             e.hra_type, e.hra_value, e.standard_allowance_type, e.standard_allowance_value, e.performance_bonus_type, e.performance_bonus_value,
             e.travel_allowance_type, e.travel_allowance_value, e.fixed_allowance_type, e.fixed_allowance_value, e.provident_fund_type, e.provident_fund_value,
             e.professional_tax_type, e.professional_tax_value, e.other_deductions_type, e.other_deductions_value,
             d.department_name, u.email, r.role_name
      FROM employees e
      LEFT JOIN users u ON e.user_id = u.id
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN departments d ON e.department_id = d.department_id
      WHERE e.user_id = $1;
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows[0];
  }

  static async findById(employeeId) {
    const query = `
      SELECT e.employee_id, e.user_id, e.full_name, e.phone, e.address, 
             e.department_id, e.designation, e.joining_date, e.salary, e.profile_image, e.company_name,
             e.dob, e.gender, e.nationality, e.personal_email, e.bank_name, e.bank_account_no, e.ifsc, e.pan, e.uan, e.emergency_contact,
             e.hra_type, e.hra_value, e.standard_allowance_type, e.standard_allowance_value, e.performance_bonus_type, e.performance_bonus_value,
             e.travel_allowance_type, e.travel_allowance_value, e.fixed_allowance_type, e.fixed_allowance_value, e.provident_fund_type, e.provident_fund_value,
             e.professional_tax_type, e.professional_tax_value, e.other_deductions_type, e.other_deductions_value,
             d.department_name, u.email,
             COALESCE(
               a.attendance_status,
               CASE 
                 WHEN EXISTS (
                   SELECT 1 FROM leave_requests lr 
                   WHERE lr.employee_id = e.employee_id 
                     AND lr.status = 'Approved' 
                     AND CURRENT_DATE BETWEEN lr.start_date AND lr.end_date
                 ) THEN 'Leave'
                 ELSE 'Absent'
               END
             ) as today_status
      FROM employees e
      LEFT JOIN users u ON e.user_id = u.id
      LEFT JOIN departments d ON e.department_id = d.department_id
      LEFT JOIN attendance a ON e.employee_id = a.employee_id AND a.attendance_date = CURRENT_DATE
      WHERE e.employee_id = $1;
    `;
    const { rows } = await pool.query(query, [employeeId]);
    return rows[0];
  }

  static async create(data, client = null) {
    const query = `
      INSERT INTO employees (
        employee_id, user_id, full_name, phone, address, department_id, designation, salary, profile_image, company_name,
        dob, gender, nationality, personal_email, bank_name, bank_account_no, ifsc, pan, uan, emergency_contact,
        hra_type, hra_value, standard_allowance_type, standard_allowance_value, performance_bonus_type, performance_bonus_value,
        travel_allowance_type, travel_allowance_value, fixed_allowance_type, fixed_allowance_value, provident_fund_type, provident_fund_value,
        professional_tax_type, professional_tax_value, other_deductions_type, other_deductions_value
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36)
      RETURNING *;
    `;
    const values = [
      data.employee_id, data.user_id, data.full_name, data.phone, data.address, data.department_id, data.designation, data.salary || 0.00, data.profile_image, data.company_name,
      data.dob || null, data.gender || null, data.nationality || null, data.personal_email || null, data.bank_name || null, data.bank_account_no || null,
      data.ifsc || null, data.pan || null, data.uan || null, data.emergency_contact || null,
      data.hra_type || 'percentage', data.hra_value !== undefined ? data.hra_value : 40.00,
      data.standard_allowance_type || 'percentage', data.standard_allowance_value !== undefined ? data.standard_allowance_value : 10.00,
      data.performance_bonus_type || 'fixed', data.performance_bonus_value !== undefined ? data.performance_bonus_value : 0.00,
      data.travel_allowance_type || 'fixed', data.travel_allowance_value !== undefined ? data.travel_allowance_value : 0.00,
      data.fixed_allowance_type || 'fixed', data.fixed_allowance_value !== undefined ? data.fixed_allowance_value : 0.00,
      data.provident_fund_type || 'percentage', data.provident_fund_value !== undefined ? data.provident_fund_value : 12.00,
      data.professional_tax_type || 'fixed', data.professional_tax_value !== undefined ? data.professional_tax_value : 200.00,
      data.other_deductions_type || 'fixed', data.other_deductions_value !== undefined ? data.other_deductions_value : 0.00
    ];
    const exec = client || pool;
    const { rows } = await exec.query(query, values);
    return rows[0];
  }

  static async update(employeeId, data) {
    const query = `
      UPDATE employees
      SET full_name = COALESCE($1, full_name),
          phone = COALESCE($2, phone),
          address = COALESCE($3, address),
          department_id = COALESCE($4, department_id),
          designation = COALESCE($5, designation),
          salary = COALESCE($6, salary),
          profile_image = COALESCE($7, profile_image),
          company_name = COALESCE($8, company_name),
          dob = COALESCE($9, dob),
          gender = COALESCE($10, gender),
          nationality = COALESCE($11, nationality),
          personal_email = COALESCE($12, personal_email),
          bank_name = COALESCE($13, bank_name),
          bank_account_no = COALESCE($14, bank_account_no),
          ifsc = COALESCE($15, ifsc),
          pan = COALESCE($16, pan),
          uan = COALESCE($17, uan),
          emergency_contact = COALESCE($18, emergency_contact),
          hra_type = COALESCE($19, hra_type),
          hra_value = COALESCE($20, hra_value),
          standard_allowance_type = COALESCE($21, standard_allowance_type),
          standard_allowance_value = COALESCE($22, standard_allowance_value),
          performance_bonus_type = COALESCE($23, performance_bonus_type),
          performance_bonus_value = COALESCE($24, performance_bonus_value),
          travel_allowance_type = COALESCE($25, travel_allowance_type),
          travel_allowance_value = COALESCE($26, travel_allowance_value),
          fixed_allowance_type = COALESCE($27, fixed_allowance_type),
          fixed_allowance_value = COALESCE($28, fixed_allowance_value),
          provident_fund_type = COALESCE($29, provident_fund_type),
          provident_fund_value = COALESCE($30, provident_fund_value),
          professional_tax_type = COALESCE($31, professional_tax_type),
          professional_tax_value = COALESCE($32, professional_tax_value),
          other_deductions_type = COALESCE($33, other_deductions_type),
          other_deductions_value = COALESCE($34, other_deductions_value)
      WHERE employee_id = $35
      RETURNING *;
    `;
    const values = [
      data.full_name, data.phone, data.address, data.department_id, data.designation, data.salary, data.profile_image, data.company_name,
      data.dob, data.gender, data.nationality, data.personal_email, data.bank_name, data.bank_account_no, data.ifsc, data.pan, data.uan, data.emergency_contact,
      data.hra_type, data.hra_value, data.standard_allowance_type, data.standard_allowance_value, data.performance_bonus_type, data.performance_bonus_value,
      data.travel_allowance_type, data.travel_allowance_value, data.fixed_allowance_type, data.fixed_allowance_value, data.provident_fund_type, data.provident_fund_value,
      data.professional_tax_type, data.professional_tax_value, data.other_deductions_type, data.other_deductions_value,
      employeeId
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async delete(employeeId) {
    const selectQuery = `SELECT user_id FROM employees WHERE employee_id = $1`;
    const selectRes = await pool.query(selectQuery, [employeeId]);
    const userId = selectRes.rows[0]?.user_id;

    if (userId) {
      await pool.query(`DELETE FROM users WHERE id = $1`, [userId]);
    } else {
      await pool.query(`DELETE FROM employees WHERE employee_id = $1`, [employeeId]);
    }
    return true;
  }

  static async getAll({ search = '', department_id = '' }) {
    let query = `
      SELECT e.employee_id, e.user_id, e.full_name, e.phone, e.address, 
             e.department_id, e.designation, e.joining_date, e.salary, e.profile_image, e.company_name,
             d.department_name, u.email, u.is_active,
             COALESCE(
               a.attendance_status,
               CASE 
                 WHEN EXISTS (
                   SELECT 1 FROM leave_requests lr 
                   WHERE lr.employee_id = e.employee_id 
                     AND lr.status = 'Approved' 
                     AND CURRENT_DATE BETWEEN lr.start_date AND lr.end_date
                 ) THEN 'Leave'
                 ELSE 'Absent'
               END
             ) as today_status
      FROM employees e
      LEFT JOIN users u ON e.user_id = u.id
      LEFT JOIN departments d ON e.department_id = d.department_id
      LEFT JOIN attendance a ON e.employee_id = a.employee_id AND a.attendance_date = CURRENT_DATE
      WHERE 1=1
    `;
    const values = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND (e.full_name ILIKE $${paramIndex} OR e.designation ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex} OR e.employee_id ILIKE $${paramIndex})`;
      values.push(`%${search}%`);
      paramIndex++;
    }

    if (department_id) {
      query += ` AND e.department_id = $${paramIndex}`;
      values.push(parseInt(department_id));
      paramIndex++;
    }

    query += ` ORDER BY e.employee_id ASC`;
    const { rows } = await pool.query(query, values);
    return rows;
  }
}

export default Employee;
