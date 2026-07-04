import React, { useState, useEffect, useContext } from 'react';
import { NotificationContext } from '../../context/NotificationContext';
import api from '../../services/api';
import './AttendanceManagement.css';

const AttendanceManagement = () => {
  const notify = useContext(NotificationContext);

  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Filters
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal Control
  const [showEditModal, setShowEditModal] = useState(false);
  const [targetLog, setTargetLog] = useState(null);

  // Edit fields
  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [status, setStatus] = useState('Present');
  const [remarks, setRemarks] = useState('');

  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      // Query records based on Date and Employee ID select
      const res = await api.get(`/admin/attendance?date=${selectedDate}&employeeId=${selectedEmployee}`);
      if (res.success) {
        setLogs(res.data);
      }

      // Load employees list for filter dropdown
      const empRes = await api.get('/employees');
      if (empRes.success) {
        setEmployees(empRes.data);
      }

      // Load departments list for filter dropdown
      const deptRes = await api.get('/departments');
      if (deptRes.success) {
        setDepartments(deptRes.data);
      }
    } catch (err) {
      console.error(err);
      notify?.showNotification('Failed to fetch attendance supervisor sheets', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDate, selectedEmployee]);

  const handleOpenEdit = (log) => {
    setTargetLog(log);
    
    // Format timestamp string for datetime-local input fields (YYYY-MM-DDTHH:MM)
    const formatDT = (dtStr) => {
      if (!dtStr) return '';
      const d = new Date(dtStr);
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    setCheckInTime(formatDT(log.check_in_time));
    setCheckOutTime(formatDT(log.check_out_time));
    setStatus(log.attendance_status);
    setRemarks(log.remarks || '');
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await api.put(`/admin/attendance/${targetLog.attendance_id}`, {
        check_in_time: checkInTime ? new Date(checkInTime) : null,
        check_out_time: checkOutTime ? new Date(checkOutTime) : null,
        attendance_status: status,
        remarks
      });

      if (res.success) {
        notify?.showNotification('Attendance log corrected successfully', 'success');
        setShowEditModal(false);
        loadData();
      }
    } catch (err) {
      console.error(err);
      notify?.showNotification(err.message || 'Failed to edit log', 'danger');
    } finally {
      setSaving(false);
    }
  };

  // Perform client-side filter computation
  const filteredLogs = logs.filter(log => {
    const matchSearch = log.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        log.employee_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (log.designation && log.designation.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchDept = selectedDept === '' || String(log.department_id) === selectedDept;
    
    return matchSearch && matchDept;
  });

  const statusOptions = ['Present', 'Absent', 'Leave', 'Half Day', 'Holiday', 'Weekend'];

  return (
    <div className="attendance-mgmt-page">
      <div className="mgmt-header">
        <h2>Attendance Supervision</h2>
        <p>Audit employee clock-in registers, filter sheets, and make timing corrections.</p>
      </div>

      {/* Filter panel */}
      <div className="mgmt-filters-card">
        <div className="filter-group">
          <label>Query Date</label>
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="filter-ctrl"
          />
        </div>
        <div className="filter-group">
          <label>Filter Employee</label>
          <select 
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="filter-ctrl"
          >
            <option value="">All Employees</option>
            {employees.map(emp => (
              <option key={emp.employee_id} value={emp.employee_id}>
                {emp.full_name} ({emp.employee_id})
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Filter Department</label>
          <select 
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="filter-ctrl"
          >
            <option value="">All Departments</option>
            {departments.map(d => (
              <option key={d.department_id} value={d.department_id}>
                {d.department_name}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group flex-grow">
          <label>Search Text</label>
          <input 
            type="text" 
            placeholder="Search by ID, name, designation..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="filter-ctrl"
          />
        </div>
      </div>

      {/* Logs Table */}
      {loading ? (
        <div className="table-loading">Refreshing attendance records...</div>
      ) : (
        <div className="attendance-table-card">
          <div className="table-responsive">
            <table className="hrms-table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Employee Name</th>
                  <th>Department</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Hours Worked</th>
                  <th>Overtime</th>
                  <th>Status</th>
                  <th>Remarks</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="10" style={{ textAlign: 'center' }}>No attendance registers logged for this query.</td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.attendance_id}>
                      <td style={{ fontWeight: '600' }}>{log.employee_id}</td>
                      <td><strong>{log.full_name}</strong></td>
                      <td>{log.department_name || 'Unassigned'}</td>
                      <td>{log.check_in_time ? new Date(log.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</td>
                      <td>{log.check_out_time ? new Date(log.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</td>
                      <td>{log.working_hours ? `${log.working_hours} hrs` : '0.00'}</td>
                      <td>{log.overtime_hours ? `${log.overtime_hours} hrs` : '0.00'}</td>
                      <td>
                        <span className={`status-badge ${log.attendance_status.toLowerCase().replace(' ', '_')}`}>
                          {log.attendance_status}
                        </span>
                      </td>
                      <td className="remarks-td">{log.remarks || '-'}</td>
                      <td>
                        <button onClick={() => handleOpenEdit(log)} className="correction-edit-btn">
                          ✏️ Correct Log
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="hrms-modal-overlay">
          <div className="hrms-modal-card">
            <div className="modal-header">
              <h3>Correct Attendance Log</h3>
              <button className="close-modal-btn" onClick={() => setShowEditModal(false)}>×</button>
            </div>

            <form onSubmit={handleSaveEdit} className="modal-form">
              <div className="form-group">
                <label className="form-label">Employee</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={`${targetLog?.full_name} (${targetLog?.employee_id})`} 
                  disabled 
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Check In Time</label>
                  <input 
                    type="datetime-local" 
                    className="form-input"
                    value={checkInTime}
                    onChange={(e) => setCheckInTime(e.target.value)}
                    disabled={saving}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Check Out Time</label>
                  <input 
                    type="datetime-local" 
                    className="form-input"
                    value={checkOutTime}
                    onChange={(e) => setCheckOutTime(e.target.value)}
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Attendance Status</label>
                <select 
                  className="form-input"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  disabled={saving}
                >
                  {statusOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Remarks / Correction Notes</label>
                <textarea 
                  className="form-input"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows="3"
                  placeholder="Explain why this correction is being made..."
                  required
                  disabled={saving}
                />
              </div>

              <div className="modal-actions-footer">
                <button type="button" className="modal-cancel-btn" onClick={() => setShowEditModal(false)} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="modal-save-btn" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Correction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceManagement;
