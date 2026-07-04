import React, { useState, useEffect, useContext } from 'react';
import { NotificationContext } from '../../context/NotificationContext';
import api from '../../services/api';
import './Payroll.css';

const Payroll = () => {
  const notify = useContext(NotificationContext);

  const [loading, setLoading] = useState(true);
  const [statements, setStatements] = useState([]);
  const [selectedStatement, setSelectedStatement] = useState(null);

  const fetchPayroll = async () => {
    try {
      setLoading(true);
      const res = await api.get('/payroll/statements');
      if (res.success) {
        setStatements(res.data);
        if (res.data.length > 0) {
          setSelectedStatement(res.data[0]); // default to latest
        }
      }
    } catch (err) {
      console.error(err);
      notify?.showNotification('Failed to retrieve payroll statement logs', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, []);

  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <div className="payroll-page-container">
      <div className="payroll-header">
        <h2>Payroll Statements</h2>
        <p>View your monthly salary breakdown statements and download pay slips.</p>
      </div>

      {loading ? (
        <div className="payroll-loading">Loading payroll data...</div>
      ) : statements.length === 0 ? (
        <div className="no-payroll-card">
          <span className="no-payroll-icon">💵</span>
          <h3>No payroll statements issued yet.</h3>
          <p>Please contact HR if you believe this is an error.</p>
        </div>
      ) : (
        <div className="payroll-content-layout">
          {/* History selection column */}
          <div className="payroll-history-sidebar">
            <h3>Statements History</h3>
            <div className="statements-list">
              {statements.map((s) => (
                <button 
                  key={s.payroll_id} 
                  className={`statement-select-btn ${selectedStatement?.payroll_id === s.payroll_id ? 'active' : ''}`}
                  onClick={() => setSelectedStatement(s)}
                >
                  <span className="statement-month">{s.month} {s.year}</span>
                  <span className="statement-amount">${parseFloat(s.net_salary).toLocaleString()}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Statement details slip column */}
          {selectedStatement && (
            <div className="payroll-details-view">
              <div className="payroll-slip-card printable-slip">
                {/* Slip Header */}
                <div className="slip-header">
                  <div className="company-info">
                    <h2>HRMS Corporation</h2>
                    <p>Enterprise Business Center, Suite 500</p>
                  </div>
                  <div className="slip-title">
                    <h3>PAYSLIP STATEMENT</h3>
                    <span>For the period: {selectedStatement.month} {selectedStatement.year}</span>
                  </div>
                </div>

                <hr className="slip-divider" />

                {/* Slip Metadata */}
                <div className="slip-meta-grid">
                  <div>
                    <span>Employee ID:</span>
                    <strong>EMP-{selectedStatement.employee_id}</strong>
                  </div>
                  <div>
                    <span>Statement Ref:</span>
                    <strong>PAY-{selectedStatement.payroll_id}</strong>
                  </div>
                  <div>
                    <span>Date Generated:</span>
                    <strong>{new Date(selectedStatement.generated_at).toLocaleDateString()}</strong>
                  </div>
                  <div>
                    <span>Authorized By:</span>
                    <strong>{selectedStatement.generated_by_name || 'System Auto'}</strong>
                  </div>
                </div>

                <hr className="slip-divider" />

                {/* Financial breakdown table */}
                <div className="slip-breakdown">
                  <div className="breakdown-column">
                    <h4>Earnings</h4>
                    <div className="breakdown-row">
                      <span>Basic Salary:</span>
                      <strong>${parseFloat(selectedStatement.basic_salary).toLocaleString()}</strong>
                    </div>
                    <div className="breakdown-row">
                      <span>Bonus / Allowances:</span>
                      <strong>${parseFloat(selectedStatement.bonus).toLocaleString()}</strong>
                    </div>
                    <div className="breakdown-row total-row">
                      <span>Gross Earnings:</span>
                      <strong>${(parseFloat(selectedStatement.basic_salary) + parseFloat(selectedStatement.bonus)).toLocaleString()}</strong>
                    </div>
                  </div>

                  <div className="breakdown-column deductions-col">
                    <h4>Deductions</h4>
                    <div className="breakdown-row">
                      <span>PF / Professional Taxes:</span>
                      <strong>${parseFloat(selectedStatement.deductions).toLocaleString()}</strong>
                    </div>
                    <div className="breakdown-row">
                      <span>Other Deductions:</span>
                      <strong>$0.00</strong>
                    </div>
                    <div className="breakdown-row total-row">
                      <span>Total Deductions:</span>
                      <strong>${parseFloat(selectedStatement.deductions).toLocaleString()}</strong>
                    </div>
                  </div>
                </div>

                <hr className="slip-divider" />

                {/* Net Pay summary */}
                <div className="slip-footer-summary">
                  <div className="net-pay-words">
                    <span>Net Pay Amount (in figures)</span>
                    <h3>${parseFloat(selectedStatement.net_salary).toLocaleString()}</h3>
                  </div>
                  <div className="signature-box">
                    <div className="signature-line"></div>
                    <span>Authorized HR Signatory</span>
                  </div>
                </div>
              </div>

              {/* Print controls */}
              <div className="slip-actions-panel">
                <button onClick={handlePrintSlip} className="print-slip-btn">
                  🖨️ Print Payslip
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Payroll;
