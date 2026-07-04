/**
 * Generates a unique Employee ID based on company name, employee initials, joining year, and serial.
 * Format: [CompanyCode][EmployeeInitials][JoiningYear][SerialNumber]
 * 
 * @param {Object} client - PostgreSQL transaction client
 * @param {Object} params - parameters
 * @param {string} params.companyName - Name of the company (e.g. 'Odoo India')
 * @param {string} params.firstName - Employee's first name
 * @param {string} params.lastName - Employee's last name
 * @param {string|Date} params.joiningDate - Joining date
 */
export const generateEmployeeId = async (client, { companyName, firstName, lastName, joiningDate }) => {
  // 1. CompanyCode
  const cleanCompany = (companyName || '').trim().replace(/[^a-zA-Z\s]/g, '').toUpperCase();
  const words = cleanCompany.split(/\s+/).filter(Boolean);
  let companyCode = 'XX';
  if (words.length >= 2) {
    companyCode = (words[0][0] || '') + (words[1][0] || '');
  } else if (words.length === 1) {
    companyCode = words[0].substring(0, 2).padEnd(2, 'X');
  }

  // 2. EmployeeInitials
  const cleanFirst = (firstName || '').trim().replace(/[^a-zA-Z]/g, '').toUpperCase();
  const cleanLast = (lastName || '').trim().replace(/[^a-zA-Z]/g, '').toUpperCase();
  let initials = 'XXXX';
  if (cleanFirst && cleanLast) {
    initials = cleanFirst.substring(0, 2).padEnd(2, 'X') + cleanLast.substring(0, 2).padEnd(2, 'X');
  } else {
    const full = cleanFirst + cleanLast;
    initials = full.substring(0, 4).padEnd(4, 'X');
  }

  // 3. Joining Year
  const year = new Date(joiningDate).getFullYear();
  if (isNaN(year)) {
    throw new Error('Invalid joining date provided for ID generation');
  }
  const joiningYear = year.toString();

  // 4. Sequential Number (Safe for concurrency by locking table)
  // Lock table to prevent race conditions during concurrent additions
  await client.query('LOCK TABLE employees IN EXCLUSIVE MODE');

  // Find all employees registered for this company and year to compute highest serial number
  const findQuery = `
    SELECT employee_id FROM employees
    WHERE company_name = $1 AND EXTRACT(YEAR FROM joining_date) = $2
  `;
  const { rows } = await client.query(findQuery, [companyName, year]);

  let maxSerial = 0;
  for (const row of rows) {
    const empId = row.employee_id;
    // Extract the final 4-digit serial (e.g. from OIJODO20260001, take the last 4 characters)
    if (empId && empId.length >= 4) {
      const serialPart = empId.substring(empId.length - 4);
      const serialNum = parseInt(serialPart, 10);
      if (!isNaN(serialNum) && serialNum > maxSerial) {
        maxSerial = serialNum;
      }
    }
  }

  const nextSerial = maxSerial + 1;
  const serialString = String(nextSerial).padStart(4, '0');

  // Construct and return final ID
  const finalId = `${companyCode}${initials}${joiningYear}${serialString}`;

  return finalId;
};
