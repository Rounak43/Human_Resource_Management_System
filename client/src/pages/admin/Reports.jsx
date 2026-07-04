import React, { useState, useEffect, useContext } from 'react';
import { NotificationContext } from '../../context/NotificationContext';
import api from '../../services/api';
import './Reports.css';

const Reports = () => {
  const notify = useContext(NotificationContext);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/reports');
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
      notify?.showNotification('Failed to generate resource analysis report sheets', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading) {
    return <div className="reports-loading">Compiling operational analytical ledger...</div>;
  }

  const { stats, charts } = data || {};

  return (
    <div className="reports-page-container">
      <div className="reports-header-row">
        <div>
          <h2>Analytical Reports</h2>
          <p>Inspect department breakdowns, check attendance metrics, and view payroll distribution.</p>
        </div>
        <button onClick={fetchReports} className="refresh-report-btn">
          🔄 Refresh Ledger
        </button>
      </div>

      {stats && (
        <div className="reports-summary-cards">
          <div className="rep-card">
            <span>Corporate Capacity</span>
            <h3>{stats.totalEmployees} Employees</h3>
            <p>Registered in system database</p>
          </div>
          <div className="rep-card">
            <span>Organizational Sectors</span>
            <h3>{stats.departmentCount} Sectors</h3>
            <p>Active business units</p>
          </div>
          <div className="rep-card">
            <span>Net Financial Expenditure</span>
            <h3>₹{stats.totalPayrollThisMonth.toLocaleString()}</h3>
            <p>Net payouts statement sum</p>
          </div>
        </div>
      )}

      {/* Visual breakdowns */}
      <div className="visualizations-grid">
        {/* Department staffing */}
        <div className="viz-card">
          <h3>Department Resource Allocations</h3>
          <p className="viz-subtitle">Count of registered headcount assigned per department</p>
          <div className="horizontal-bar-list">
            {charts?.departmentDistribution.map((dept, idx) => {
              const maxVal = Math.max(...charts.departmentDistribution.map(d => d.value), 1);
              const percentage = (dept.value / maxVal) * 100;
              return (
                <div key={idx} className="horiz-bar-item">
                  <span className="horiz-bar-name">{dept.name}</span>
                  <div className="horiz-bar-line-container">
                    <div className="horiz-bar-fill" style={{ width: `${percentage}%` }} />
                  </div>
                  <span className="horiz-bar-count">{dept.value} staff</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Leave categories list */}
        <div className="viz-card">
          <h3>Leave Allocation Logs</h3>
          <p className="viz-subtitle">Volume of absence requests classified by status</p>
          <div className="pie-donut-fallback-list">
            {charts?.leaveStatistics.length === 0 ? (
              <p className="no-data-text">No leaves recorded.</p>
            ) : (
              charts?.leaveStatistics.map((leave, idx) => (
                <div key={idx} className="donut-stat-row">
                  <div className="bullet-dot" />
                  <span className="stat-label">{leave.type}</span>
                  <span className="stat-value">{leave.count} files</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Financial records timeline */}
      <div className="viz-card full-width-viz">
        <h3>Payroll Payout Trends</h3>
        <p className="viz-subtitle">Total month-on-month operational expense statements</p>
        <div className="bar-charts-trend">
          {charts?.payrollStatistics.length === 0 ? (
            <p className="no-data-text">No statements recorded in ledger.</p>
          ) : (
            charts?.payrollStatistics.map((item, idx) => {
              const maxAmount = Math.max(...charts.payrollStatistics.map(p => p.amount), 1);
              const heightPercentage = Math.min(100, (item.amount / maxAmount) * 100);
              return (
                <div key={idx} className="trend-bar-container">
                  <span className="trend-val">₹{item.amount.toLocaleString()}</span>
                  <div className="trend-bar-fill" style={{ height: `${heightPercentage}%` }} />
                  <span className="trend-label">{item.period}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
