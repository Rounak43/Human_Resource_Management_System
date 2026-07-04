import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { NotificationContext } from '../../context/NotificationContext';
import api from '../../services/api';
import './PayrollManagement.css';

const PayrollManagement = () => {
  const location = useLocation();
  const notify = useContext(NotificationContext);

  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [payrollRecords, setPayrollRecords] = useState([]);

  // Generate Payroll form fields
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('July');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [bonus, setBonus] = useState('0');
  const [deductions, setDeductions] = useState('0');
  
  // Salary config update modal
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [targetEmp, setTargetEmp] = useState(null);
  const [newSalary, setNewSalary] = useState('');
  
  const [processing, setProcessing] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const empRes = await api.get('/admin/employees');
      if (empRes.success) {
        setEmployees(empRes.data);
        if (empRes.data.length > 0) setSelectedEmployee(empRes.data[0].employee_id);
      }

      const payrollRes = await api.get('/admin/payroll');
      if (payrollRes.success) {
        setPayrollRecords(payrollRes.data);
      }
    } catch (err) {
      console.error(err);
      notify?.showNotification('Failed to retrieve payroll statement logs', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Listen to navigation state for quick-processing triggers
  useEffect(() => {
    if (employees.length > 0 && location.state?.processEmpId) {
      setSelectedEmployee(location.state.processEmpId);
    }
  }, [location.state, employees]);

  const handleGeneratePayroll = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) {
      notify?.showNotification('Please select an employee', 'warning');
      return;
    }

    setProcessing(true);
    try {
      const res = await api.post(`/admin/payroll/${selectedEmployee}`, {
        month: selectedMonth,
        year: parseInt(selectedYear),
        bonus: parseFloat(bonus),
        deductions: parseFloat(deductions)
      });

      if (res.success) {
        notify?.showNotification(`Payroll statement generated successfully!`, 'success');
        setBonus('0');
        setDeductions('0');
        loadData();
      }
    } catch (err) {
      console.error(err);
      notify?.showNotification(err.message || 'Generation failed', 'danger');
    } finally {
      setProcessing(false);
    }
  };

  const handleOpenSalaryEdit = (emp) => {
    setTargetEmp(emp);
    setNewSalary(emp.salary);
    setShowSalaryModal(true);
  };

  const handleSaveSalary = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const res = await api.put(`/admin/payroll/salary/${targetEmp.employee_id}`, {
        salary: parseFloat(newSalary)
      });

      if (res.success) {
        notify?.showNotification('Basic salary configured successfully', 'success');
        setShowSalaryModal(false);
        loadData();
      }
    } catch (err) {
      console.error(err);
      notify?.showNotification(err.message || 'Salary update failed', 'danger');
    } finally {
      setProcessing(false);
    }
  };

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="payroll-mgmt-page">
      <div className="mgmt-header">
        <h2>Payroll Control Center</h2>
        <p>Configure employee basic salaries, insert bonuses, and trigger monthly payroll declarations.</p>
      </div>

      <div className="payroll-layout-grid">
        {/* Left Side: Actions (Generate and Update) */}
        <div className="payroll-actions-column">
          {/* Generate Panel */}
          <div className="payroll-form-card">
            <h3>Generate Payroll Statement</h3>
            <form onSubmit={handleGeneratePayroll} className="payroll-form">
              <div className="form-group">
                <label className="form-label">Target Employee</label>
                <select 
                  value={selectedEmployee} 
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="form-input"
                  required
                >
                  {employees.map(emp => (
                    <option key={emp.employee_id} value={emp.employee_id}>
                      {emp.full_name} (₹{parseFloat(emp.salary).toLocaleString()}/mo)
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Statement Month</label>
                  <select 
                    value={selectedMonth} 
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="form-input"
                    required
                  >
                    {months.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Statement Year</label>
                  <input 
                    type="number" 
                    value={selectedYear} 
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="form-input"
                    required 
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Bonus / Allowances (₹)</label>
                  <input 
                    type="number" 
                    value={bonus} 
                    onChange={(e) => setBonus(e.target.value)}
                    className="form-input" 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Deductions (₹)</label>
                  <input 
                    type="number" 
                    value={deductions} 
                    onChange={(e) => setDeductions(e.target.value)}
                    className="form-input" 
                    required 
                  />
                </div>
              </div>

              <button type="submit" className="payroll-generate-btn" disabled={processing}>
                {processing ? 'Generating Statement...' : '⚡ Generate Statement'}
              </button>
            </form>
          </div>

          {/* Salary Config Panel */}
          <div className="payroll-form-card">
            <h3>Salary Scaling Configurations</h3>
            <div className="salary-config-list">
              {employees.slice(0, 5).map(emp => (
                <div key={emp.employee_id} className="salary-config-item">
                  <div className="emp-detail-preview">
                    <strong>{emp.full_name}</strong>
                    <span>{emp.designation} &bull; {emp.department_name}</span>
                  </div>
                  <div className="salary-value-trigger">
                    <strong>₹{parseFloat(emp.salary).toLocaleString()}</strong>
                    <button onClick={() => handleOpenSalaryEdit(emp)} className="adjust-salary-trigger">
                      ✏️ Scale
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Ledger View */}
        <div className="payroll-ledger-column">
          <div className="payroll-ledger-card">
            <h3>Payroll Ledger Log</h3>
            {loading ? (
              <div className="table-loading">Refreshing financial logs...</div>
            ) : (
              <div className="table-responsive">
                <table className="hrms-table">
                  <thead>
                    <tr>
                      <th>Ref ID</th>
                      <th>Employee</th>
                      <th>Period</th>
                      <th>Basic Pay</th>
                      <th>Bonus</th>
                      <th>Deductions</th>
                      <th>Net Paid</th>
                      <th>Authorized By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payrollRecords.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center' }}>No payroll declarations found in ledger.</td>
                      </tr>
                    ) : (
                      payrollRecords.map((rec) => (
                        <tr key={rec.payroll_id}>
                          <td>PAY-{rec.payroll_id}</td>
                          <td><strong>{rec.full_name}</strong></td>
                          <td>{rec.month} {rec.year}</td>
                          <td>₹{parseFloat(rec.basic_salary).toLocaleString()}</td>
                          <td>+₹{parseFloat(rec.bonus).toLocaleString()}</td>
                          <td>-₹{parseFloat(rec.deductions).toLocaleString()}</td>
                          <td className="net-pay-col">₹{parseFloat(rec.net_salary).toLocaleString()}</td>
                          <td>{rec.generated_by_name || 'System Auto'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SALARY EDIT MODAL */}
      {showSalaryModal && (
        <div className="hrms-modal-overlay">
          <div className="hrms-modal-card">
            <div className="modal-header">
              <h3>Scale Basic Salary</h3>
              <button className="close-modal-btn" onClick={() => setShowSalaryModal(false)}>×</button>
            </div>

            <form onSubmit={handleSaveSalary} className="modal-form">
              <p className="modal-sub-label">Adjusting base monthly salary structure for: <strong>{targetEmp?.full_name}</strong></p>
              
              <div className="form-group">
                <label className="form-label">New Monthly Basic Salary (₹)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={newSalary} 
                  onChange={(e) => setNewSalary(e.target.value)}
                  required
                  disabled={processing}
                />
              </div>

              <div className="modal-actions-footer">
                <button type="button" className="modal-cancel-btn" onClick={() => setShowSalaryModal(false)} disabled={processing}>
                  Cancel
                </button>
                <button type="submit" className="modal-save-btn" disabled={processing}>
                  {processing ? 'Saving...' : 'Save Configuration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollManagement;
