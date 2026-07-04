import React from 'react';
import './SalarySlip.css';

/**
 * SalarySlip Component
 * 
 * Props:
 * - basicSalary (number)
 * - bonus (number)
 * - deductions (number)
 * - month (string)
 */
const SalarySlip = ({ basicSalary = 0, bonus = 0, deductions = 0, month = '' }) => {
  return (
    <div className="salary-slip">
      {/* Component layout representing salary statement details */}
      <h4>Salary Statement - {month}</h4>
    </div>
  );
};

export default SalarySlip;
