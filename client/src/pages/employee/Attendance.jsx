import React, { useState, useEffect, useContext } from 'react';
import { NotificationContext } from '../../context/NotificationContext';
import api from '../../services/api';
import './Attendance.css';

const Attendance = () => {
  const notify = useContext(NotificationContext);

  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().substring(0, 7));
  const [todayRecord, setTodayRecord] = useState(null);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/attendance/history?month=${selectedMonth}`);
      if (res.success) {
        setLogs(res.data);

        // Find today's check in/out record
        const todayStr = new Date().toISOString().substring(0, 10);
        const todayLog = res.data.find(log => {
          const logDateStr = new Date(log.attendance_date).toISOString().substring(0, 10);
          return logDateStr === todayStr;
        });
        setTodayRecord(todayLog || null);
      }
    } catch (err) {
      console.error(err);
      notify?.showNotification('Failed to retrieve attendance logs', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedMonth]);

  const handleCheckIn = async () => {
    try {
      const res = await api.post('/attendance/check-in', { checkInTime: new Date() });
      if (res.success) {
        notify?.showNotification('Clocked in successfully!', 'success');
        fetchAttendance();
      }
    } catch (err) {
      notify?.showNotification(err.message || 'Check-in failed', 'danger');
    }
  };

  const handleCheckOut = async () => {
    try {
      const res = await api.post('/attendance/check-out', { checkOutTime: new Date() });
      if (res.success) {
        notify?.showNotification('Clocked out successfully!', 'success');
        fetchAttendance();
      }
    } catch (err) {
      notify?.showNotification(err.message || 'Check-out failed', 'danger');
    }
  };

  // Compute Metrics
  const totalDays = logs.length;
  const presentDays = logs.filter(l => l.attendance_status === 'Present').length;
  const totalHours = logs.reduce((sum, l) => sum + parseFloat(l.working_hours || 0), 0).toFixed(1);
  const totalOvertime = logs.reduce((sum, l) => sum + parseFloat(l.overtime_hours || 0), 0).toFixed(1);
  const totalLateMinutes = logs.reduce((sum, l) => sum + parseInt(l.late_minutes || 0), 0);

  const monthsList = [
    { value: '2026-07', label: 'July 2026' },
    { value: '2026-06', label: 'June 2026' },
    { value: '2026-05', label: 'May 2026' },
    { value: '2026-04', label: 'April 2026' }
  ];

  return (
    <div className="attendance-page-container">
      <div className="attendance-header">
        <div>
          <h2>Attendance Log</h2>
          <p>Track your daily login timings, working hours, and overtime logs.</p>
        </div>
        <div className="month-select-filter">
          <label>Filter Month: </label>
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="filter-select"
          >
            {monthsList.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Control Panel */}
      <div className="attendance-control-card">
        <div className="control-details">
          <h3>Daily Timing Clock</h3>
          <p>Today is {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <div className="clock-times-preview">
            <div>
              <span>Check In</span>
              <strong>{todayRecord?.check_in_time ? new Date(todayRecord.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</strong>
            </div>
            <div>
              <span>Check Out</span>
              <strong>{todayRecord?.check_out_time ? new Date(todayRecord.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</strong>
            </div>
          </div>
        </div>
        <div className="control-buttons">
          {!todayRecord?.check_in_time ? (
            <button className="clock-btn clock-in" onClick={handleCheckIn}>
              ⚡ Clock In
            </button>
          ) : (
            <button 
              className="clock-btn clock-out" 
              onClick={handleCheckOut}
              disabled={!!todayRecord?.check_out_time}
            >
              🛑 Clock Out
            </button>
          )}
        </div>
      </div>

      {/* Metrics Summary Grid */}
      <div className="metrics-summary-grid">
        <div className="metric-box">
          <span className="metric-num">{totalDays}</span>
          <span className="metric-lbl">Total Days Logged</span>
        </div>
        <div className="metric-box">
          <span className="metric-num text-success">{presentDays}</span>
          <span className="metric-lbl">Days Present</span>
        </div>
        <div className="metric-box">
          <span className="metric-num">{totalHours} hrs</span>
          <span className="metric-lbl">Total Hours Worked</span>
        </div>
        <div className="metric-box">
          <span className="metric-num text-warning">{totalOvertime} hrs</span>
          <span className="metric-lbl">Overtime Earned</span>
        </div>
        <div className="metric-box">
          <span className="metric-num text-danger">{totalLateMinutes} m</span>
          <span className="metric-lbl">Total Late Minutes</span>
        </div>
      </div>

      {/* History table */}
      <div className="attendance-history-table-card">
        <h3>Attendance History</h3>
        {loading ? (
          <div className="table-loading">Refreshing attendance list...</div>
        ) : (
          <div className="table-responsive">
            <table className="hrms-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Working Hours</th>
                  <th>Overtime Hours</th>
                  <th>Late Minutes</th>
                  <th>Early Leaves</th>
                  <th>Status</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center' }}>No attendance records found for this month.</td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.attendance_id}>
                      <td>{new Date(log.attendance_date).toLocaleDateString()}</td>
                      <td>{log.check_in_time ? new Date(log.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</td>
                      <td>{log.check_out_time ? new Date(log.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</td>
                      <td>{log.working_hours ? `${log.working_hours} hrs` : '0.00'}</td>
                      <td>{log.overtime_hours ? `${log.overtime_hours} hrs` : '0.00'}</td>
                      <td>{log.late_minutes ? `${log.late_minutes} min` : '0'}</td>
                      <td>{log.early_leave_minutes ? `${log.early_leave_minutes} min` : '0'}</td>
                      <td>
                        <span className={`status-badge ${log.attendance_status.toLowerCase()}`}>
                          {log.attendance_status}
                        </span>
                      </td>
                      <td className="table-remarks">{log.remarks || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;
