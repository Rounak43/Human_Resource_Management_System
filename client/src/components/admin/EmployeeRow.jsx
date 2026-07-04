import React from 'react';
import './EmployeeRow.css';

/**
 * EmployeeRow Component
 * 
 * Props:
 * - employee (object): Record items (name, email, designation, department).
 * - onEdit (function): Edit click callback.
 * - onDelete (function): Delete click callback.
 */
const EmployeeRow = ({ employee, onEdit, onDelete }) => {
  return (
    <tr className="employee-row">
      {/* Component cells mapping employee details */}
      <td>Sample Name</td>
    </tr>
  );
};

export default EmployeeRow;
