import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { NotificationContext } from '../../context/NotificationContext';
import api from '../../services/api';
import './Dashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const notify = useContext(NotificationContext);

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [employees, setEmployees] = useState([]);
  
  // Search & Filter controls
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [sortField, setSortField] = useState('employee_id');
  const [sortOrder, setSortOrder] = useState('asc');

  const [departmentsList, setDepartmentsList] = useState([]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const repRes = await api.get('/admin/reports');
      if (repRes.success) {
        setStats(repRes.data.stats);
        setCharts(repRes.data.charts);
      }

      const empRes = await api.get('/admin/employees');
      if (empRes.success) {
        setEmployees(empRes.data);
      }

      const deptRes = await api.get('/departments');
      if (deptRes.success) {
        setDepartmentsList(deptRes.data);
      }
    } catch (err) {
      console.error(err);
      notify?.showNotification('Failed to load administrative analytics', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleSort = (field) => {
    const order = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(order);
  };

  if (loading) {
    return <div className="admin-dashboard-loading">Resolving Admin Control Center...</div>;
  }

  // Filter & Search
  const filteredEmployees = employees.filter((emp) => {
    const matchSearch = emp.full_name.toLowerCase().includes(search.toLowerCase()) || 
                        emp.designation.toLowerCase().includes(search.toLowerCase()) ||
                        (emp.email && emp.email.toLowerCase().includes(search.toLowerCase()));
    const matchDept = department === '' || String(emp.department_id) === department;
    return matchSearch && matchDept;
  });

  // Sort
  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="admin-dashboard-container">
      <div className="admin-welcome-banner">
        <div>
          <h1>Enterprise Resource Supervisor</h1>
          <p>Supervise employee files, verify logs, compute payroll statements, and inspect analytics.</p>
        </div>
        <div className="admin-quick-actions">
          <button onClick={() => navigate('/admin/employees')} className="action-btn-admin add-emp-btn">
            ➕ Add Employee
          </button>
          <button onClick={() => navigate('/admin/leaves')} className="action-btn-admin review-leaves-btn">
            ✉️ Review Leaves
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="admin-stats-grid">
          <div className="admin-stats-card">
            <span className="card-ico">👥</span>
            <div>
              <span className="lbl">Total Employees</span>
              <span className="val">{stats.totalEmployees}</span>
            </div>
          </div>
          <div className="admin-stats-card present-card">
            <span className="card-ico">✅</span>
            <div>
              <span className="lbl">Present Today</span>
              <span className="val">{stats.presentToday}</span>
            </div>
          </div>
          <div className="admin-stats-card absent-card">
            <span className="card-ico">❌</span>
            <div>
              <span className="lbl">Absent Today</span>
              <span className="val">{stats.absentToday}</span>
            </div>
          </div>
          <div className="admin-stats-card pending-card">
            <span className="card-ico">⏳</span>
            <div>
              <span className="lbl">Pending Leaves</span>
              <span className="val">{stats.pendingLeaves}</span>
            </div>
          </div>
          <div className="admin-stats-card approved-card">
            <span className="card-ico">🌴</span>
            <div>
              <span className="lbl">Approved Leaves</span>
              <span className="val">{stats.approvedLeaves}</span>
            </div>
          </div>
          <div className="admin-stats-card payroll-card">
            <span className="card-ico">💵</span>
            <div>
              <span className="lbl">Monthly Net Payroll</span>
              <span className="val">₹{stats.totalPayrollThisMonth.toLocaleString()}</span>
            </div>
          </div>
          <div className="admin-stats-card dept-card">
            <span className="card-ico">🏢</span>
            <div>
              <span className="lbl">Departments</span>
              <span className="val">{stats.departmentCount}</span>
            </div>
          </div>
        </div>
      )}

      {/* Charts Panels */}
      <div className="admin-charts-grid">
        {/* Department Distribution */}
        <div className="chart-wrapper-card">
          <h3>Department Distribution</h3>
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
                  <span className="horiz-bar-count">{dept.value} emp</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Leave distribution */}
        <div className="chart-wrapper-card">
          <h3>Leave Status Distribution</h3>
          <div className="leave-status-summary">
            {charts?.leaveStatistics.length === 0 ? (
              <p className="no-data-text">No active leave files.</p>
            ) : (
              charts?.leaveStatistics.map((leave, idx) => (
                <div key={idx} className="leave-stat-row">
                  <span>{leave.type}</span>
                  <strong>{leave.count} requests</strong>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <div className="employee-table-card">
        <div className="table-header-filters">
          <h3>Active Employee Directory</h3>
          <div className="filters-row">
            <input 
              type="text" 
              placeholder="Search by name, email, title..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="filter-input-text"
            />
            <select 
              value={department} 
              onChange={(e) => setDepartment(e.target.value)}
              className="filter-input-select"
            >
              <option value="">All Departments</option>
              {departmentsList.map(d => (
                <option key={d.department_id} value={d.department_id}>{d.department_name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="hrms-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('employee_id')} className="sortable-th">
                  Employee ID {sortField === 'employee_id' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => handleSort('full_name')} className="sortable-th">
                  Full Name {sortField === 'full_name' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th>Department</th>
                <th>Designation</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedEmployees.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center' }}>No employees registered matching filters.</td>
                </tr>
              ) : (
                sortedEmployees.map((emp) => (
                  <tr key={emp.employee_id}>
                    <td>EMP-{emp.employee_id}</td>
                    <td>
                      <div className="name-email-cell">
                        <strong>{emp.full_name}</strong>
                        <span>{emp.email}</span>
                      </div>
                    </td>
                    <td>{emp.department_name || 'Unassigned'}</td>
                    <td>{emp.designation || 'Staff'}</td>
                    <td>{emp.phone || '-'}</td>
                    <td>
                      <span className={`status-badge ${emp.is_active ? 'present' : 'absent'}`}>
                        {emp.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td>
                      <div className="table-action-triggers">
                        <button onClick={() => navigate('/admin/employees', { state: { editEmpId: emp.employee_id } })} className="edit-btn">
                          ✏️ Edit
                        </button>
                        <button onClick={() => navigate('/admin/payroll', { state: { processEmpId: emp.employee_id } })} className="payroll-btn">
                          💵 Payroll
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
