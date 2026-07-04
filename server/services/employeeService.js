import Employee from '../models/Employee.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { hashPassword } from '../utils/helpers.js';
import { generateEmployeeId } from '../utils/employeeIdGenerator.js';
import { generateTemporaryPassword } from '../utils/passwordGenerator.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';
import pool from '../config/db.js';

export const employeeService = {
  // ----- User Profile (Standard Employee Actions) -----
  getProfile: async (userId) => {
    const profile = await Employee.findByUserId(userId);
    if (!profile) {
      throw new NotFoundError('Employee profile not found');
    }
    return profile;
  },

  updateProfile: async (userId, profileData) => {
    const profile = await Employee.findByUserId(userId);
    if (!profile) {
      throw new NotFoundError('Employee profile not found');
    }

    if (profileData.newPassword) {
      const hashedPassword = await hashPassword(profileData.newPassword);
      await User.updatePassword(userId, hashedPassword);

      // Trigger Security Notification
      try {
        await Notification.create({
          employeeId: profile.employee_id,
          title: 'Password Changed',
          message: 'Your account portal password has been changed successfully.',
          type: 'Security'
        });
      } catch (err) {
        console.error('Failed to register password change notification', err);
      }
    }

    // Standard profile updates only allow editing Phone, Address, and Profile Image
    return Employee.update(profile.employee_id, {
      phone: profileData.phone,
      address: profileData.address,
      profile_image: profileData.profile_image
    });
  },

  // ----- Administrative CRUD Operations -----
  createEmployee: async (employeeData) => {
    const { 
      firstName, lastName, joiningDate, departmentId, role, companyName, email, phone, address, designation, salary, profileImage,
      dob, gender, nationality, personalEmail, bankName, bankAccountNo, ifsc, pan, uan, emergencyContact,
      hraType, hraValue, standardAllowanceType, standardAllowanceValue, performanceBonusType, performanceBonusValue,
      travelAllowanceType, travelAllowanceValue, fixedAllowanceType, fixedAllowanceValue, providentFundType, providentFundValue,
      professionalTaxType, professionalTaxValue, otherDeductionsType, otherDeductionsValue
    } = employeeData;

    // 1. Validate email uniqueness
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new BadRequestError('Email address already registered.');
    }

    const tempPassword = generateTemporaryPassword();
    const hashedPassword = await hashPassword(tempPassword);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 2. Generate unique Employee ID
      const employeeId = await generateEmployeeId(client, {
        companyName,
        firstName,
        lastName,
        joiningDate
      });

      // 3. Double check uniqueness of generated ID
      const idCheckRes = await client.query('SELECT 1 FROM employees WHERE employee_id = $1', [employeeId]);
      if (idCheckRes.rows.length > 0) {
        throw new BadRequestError('Generated Employee ID conflict occurred. Please retry.');
      }

      // 4. Create Employee record (including new extended private fields and salary configuration)
      const fullName = `${firstName} ${lastName}`;
      const empRes = await Employee.create({
        employee_id: employeeId,
        user_id: null,
        full_name: fullName,
        phone: phone || null,
        address: address || null,
        department_id: departmentId ? parseInt(departmentId) : null,
        designation: designation || 'Staff',
        joining_date: joiningDate,
        salary: salary ? parseFloat(salary) : 0.00,
        profile_image: profileImage || null,
        company_name: companyName,
        dob: dob || null,
        gender: gender || null,
        nationality: nationality || null,
        personal_email: personalEmail || null,
        bank_name: bankName || null,
        bank_account_no: bankAccountNo || null,
        ifsc: ifsc || null,
        pan: pan || null,
        uan: uan || null,
        emergency_contact: emergencyContact || null,
        hra_type: hraType || 'percentage',
        hra_value: hraValue !== undefined ? parseFloat(hraValue) : 40.00,
        standard_allowance_type: standardAllowanceType || 'percentage',
        standard_allowance_value: standardAllowanceValue !== undefined ? parseFloat(standardAllowanceValue) : 10.00,
        performance_bonus_type: performanceBonusType || 'fixed',
        performance_bonus_value: performanceBonusValue !== undefined ? parseFloat(performanceBonusValue) : 0.00,
        travel_allowance_type: travelAllowanceType || 'fixed',
        travel_allowance_value: travelAllowanceValue !== undefined ? parseFloat(travelAllowanceValue) : 0.00,
        fixed_allowance_type: fixedAllowanceType || 'fixed',
        fixed_allowance_value: fixedAllowanceValue !== undefined ? parseFloat(fixedAllowanceValue) : 0.00,
        provident_fund_type: providentFundType || 'percentage',
        provident_fund_value: providentFundValue !== undefined ? parseFloat(providentFundValue) : 12.00,
        professional_tax_type: professionalTaxType || 'fixed',
        professional_tax_value: professionalTaxValue !== undefined ? parseFloat(professionalTaxValue) : 200.00,
        other_deductions_type: otherDeductionsType || 'fixed',
        other_deductions_value: otherDeductionsValue !== undefined ? parseFloat(otherDeductionsValue) : 0.00
      }, client);

      // 5. Map system role ID
      let roleId = 2; // Default to Employee (2)
      if (role && (role.toLowerCase() === 'admin' || role.toLowerCase() === 'hr')) {
        roleId = 1;
      }

      // 6. Create User credentials (must_change_password = true)
      const userQuery = `
        INSERT INTO users (employee_id, email, password_hash, role_id, is_active, must_change_password)
        VALUES ($1, $2, $3, $4, TRUE, TRUE)
        RETURNING id;
      `;
      const userRes = await client.query(userQuery, [employeeId, email, hashedPassword, roleId]);
      const userId = userRes.rows[0].id;

      // 7. Update Employee backlink to user record
      await client.query('UPDATE employees SET user_id = $1 WHERE employee_id = $2', [userId, employeeId]);

      await client.query('COMMIT');

      return {
        employeeId,
        temporaryPassword: tempPassword,
        employee: empRes
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  getAllEmployees: async (search = '', department = '') => {
    return Employee.getAll({ search, department_id: department });
  },

  getEmployeeById: async (employeeId) => {
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      throw new NotFoundError(`Employee with ID ${employeeId} not found.`);
    }
    return employee;
  },

  updateEmployee: async (employeeId, employeeData) => {
    const existing = await Employee.findById(employeeId);
    if (!existing) {
      throw new NotFoundError(`Employee with ID ${employeeId} not found.`);
    }

    // Admin updates all fields, supporting camelCase or snake_case parameters
    const updated = await Employee.update(employeeId, {
      full_name: employeeData.full_name || employeeData.fullName || (employeeData.firstName && employeeData.lastName ? `${employeeData.firstName} ${employeeData.lastName}` : null),
      phone: employeeData.phone,
      address: employeeData.address,
      department_id: employeeData.department_id !== undefined ? employeeData.department_id : employeeData.departmentId,
      designation: employeeData.designation,
      salary: employeeData.salary !== undefined ? parseFloat(employeeData.salary) : undefined,
      profile_image: employeeData.profile_image || employeeData.profileImage,
      company_name: employeeData.company_name || employeeData.companyName,
      dob: employeeData.dob,
      gender: employeeData.gender,
      nationality: employeeData.nationality,
      personal_email: employeeData.personal_email || employeeData.personalEmail,
      bank_name: employeeData.bank_name || employeeData.bankName,
      bank_account_no: employeeData.bank_account_no || employeeData.bankAccountNo,
      ifsc: employeeData.ifsc,
      pan: employeeData.pan,
      uan: employeeData.uan,
      emergency_contact: employeeData.emergency_contact || employeeData.emergencyContact,
      hra_type: employeeData.hra_type || employeeData.hraType,
      hra_value: employeeData.hra_value !== undefined ? parseFloat(employeeData.hra_value) : (employeeData.hraValue !== undefined ? parseFloat(employeeData.hraValue) : undefined),
      standard_allowance_type: employeeData.standard_allowance_type || employeeData.standardAllowanceType,
      standard_allowance_value: employeeData.standard_allowance_value !== undefined ? parseFloat(employeeData.standard_allowance_value) : (employeeData.standardAllowanceValue !== undefined ? parseFloat(employeeData.standardAllowanceValue) : undefined),
      performance_bonus_type: employeeData.performance_bonus_type || employeeData.performanceBonusType,
      performance_bonus_value: employeeData.performance_bonus_value !== undefined ? parseFloat(employeeData.performance_bonus_value) : (employeeData.performanceBonusValue !== undefined ? parseFloat(employeeData.performanceBonusValue) : undefined),
      travel_allowance_type: employeeData.travel_allowance_type || employeeData.travelAllowanceType,
      travel_allowance_value: employeeData.travel_allowance_value !== undefined ? parseFloat(employeeData.travel_allowance_value) : (employeeData.travelAllowanceValue !== undefined ? parseFloat(employeeData.travelAllowanceValue) : undefined),
      fixed_allowance_type: employeeData.fixed_allowance_type || employeeData.fixedAllowanceType,
      fixed_allowance_value: employeeData.fixed_allowance_value !== undefined ? parseFloat(fixed_allowance_value) : (employeeData.fixedAllowanceValue !== undefined ? parseFloat(fixedAllowanceValue) : undefined),
      provident_fund_type: employeeData.provident_fund_type || employeeData.providentFundType,
      provident_fund_value: employeeData.provident_fund_value !== undefined ? parseFloat(employeeData.provident_fund_value) : (employeeData.providentFundValue !== undefined ? parseFloat(employeeData.providentFundValue) : undefined),
      professional_tax_type: employeeData.professional_tax_type || employeeData.professionalTaxType,
      professional_tax_value: employeeData.professional_tax_value !== undefined ? parseFloat(employeeData.professional_tax_value) : (employeeData.professionalTaxValue !== undefined ? parseFloat(employeeData.professionalTaxValue) : undefined),
      other_deductions_type: employeeData.other_deductions_type || employeeData.otherDeductionsType,
      other_deductions_value: employeeData.other_deductions_value !== undefined ? parseFloat(employeeData.other_deductions_value) : (employeeData.otherDeductionsValue !== undefined ? parseFloat(employeeData.otherDeductionsValue) : undefined)
    });

    if (employeeData.email) {
      await pool.query('UPDATE users SET email = $1 WHERE employee_id = $2', [employeeData.email, employeeId]);
    }

    return updated;
  },

  deleteEmployee: async (employeeId) => {
    const existing = await Employee.findById(employeeId);
    if (!existing) {
      throw new NotFoundError(`Employee with ID ${employeeId} not found.`);
    }
    return Employee.delete(employeeId);
  }
};
