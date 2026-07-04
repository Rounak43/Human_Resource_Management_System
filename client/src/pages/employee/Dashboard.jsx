import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { NotificationContext } from '../../context/NotificationContext';
import api from '../../services/api';
import './Dashboard.css';

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const notify = useContext(NotificationContext);

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  // Today's log details
  const [todayLog, setTodayLog] = useState(null);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const profileRes = await api.get('/employee/profile');
      if (profileRes.success) setProfile(profileRes.data);

      const attendRes = await api.get('/attendance/history');
      if (attendRes.success) {
        setAttendance(attendRes.data);
        // Find if there is a log for today
        const todayStr = new Date().toISOString().substring(0, 10);
        const todayRecord = attendRes.data.find(log => {
          const logDateStr = new Date(log.attendance_date).toISOString().substring(0, 10);
          return logDateStr === todayStr;
        });
        setTodayLog(todayRecord || null);
      }

      const notifyRes = await api.get('/notifications');
      if (notifyRes.success) setNotifications(notifyRes.data.slice(0, 5)); // recent 5
    } catch (err) {
      console.error(err);
      notify?.showNotification('Failed to fetch dashboard data', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleCheckIn = async () => {
    try {
      const res = await api.post('/attendance/check-in', { checkInTime: new Date() });
      if (res.success) {
        notify?.showNotification('Checked in successfully!', 'success');
        loadDashboardData();
      }
    } catch (err) {
      notify?.showNotification(err.message || 'Check-in failed', 'danger');
    }
  };

  const handleCheckOut = async () => {
    try {
      const res = await api.post('/attendance/check-out', { checkOutTime: new Date() });
      if (res.success) {
        notify?.showNotification('Checked out successfully!', 'success');
        loadDashboardData();
      }
    } catch (err) {
      notify?.showNotification(err.message || 'Check-out failed', 'danger');
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading Employee Workspace...</div>;
  }

  // Calculates leaves balance (base 30, subtracting placeholder)
  const leaveBalance = 25; // Default mockup balance

  // Calculate statistics
  const currentMonthLogs = attendance.filter(log => {
    const logDate = new Date(log.attendance_date);
    const now = new Date();
    return logDate.getMonth() === now.getMonth() && logDate.getFullYear() === now.getFullYear();
  });
  const presentDays = currentMonthLogs.filter(log => log.attendance_status === 'Present').length;
  const attendancePercentage = currentMonthLogs.length > 0 
    ? Math.round((presentDays / currentMonthLogs.length) * 100) 
    : 100;

  // Render check-in details
  const checkInDisp = todayLog?.check_in_time 
    ? new Date(todayLog.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    : '--:--';
  const checkOutDisp = todayLog?.check_out_time 
    ? new Date(todayLog.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    : '--:--';

  const upcomingHolidays = [
    { date: 'Aug 15', name: 'Independence Day' },
    { date: 'Sep 07', name: 'Labor Day Holiday' },
    { date: 'Oct 02', name: 'Gandhi Jayanti' }
  ];

  // Dummy monthly logs representation for chart
  const weeklyHoursData = [
    { day: 'Mon', hours: todayLog ? 8.2 : 8.0 },
    { day: 'Tue', hours: 7.75 },
    { day: 'Wed', hours: 9.50 },
    { day: 'Thu', hours: 8.0 },
    { day: 'Fri', hours: 6.5 }
  ];

  return (
    <div className="employee-dashboard-container">
      <div className="welcome-banner">
        <div>
          <h1>Welcome back, {profile?.full_name || 'Employee'}!</h1>
          <p>Portal Dashboard &bull; {profile?.designation || 'Software Engineer'}</p>
        </div>
        <div className="quick-clock-panel">
          {!todayLog?.check_in_time ? (
            <button className="action-btn check-in-btn" onClick={handleCheckIn}>
              ⚡ Clock In
            </button>
          ) : (
            <button 
              className="action-btn check-out-btn" 
              onClick={handleCheckOut} 
              disabled={!!todayLog?.check_out_time}
            >
              🛑 Clock Out
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="stats-grid">
        <div className="stats-card">
          <span className="card-icon">🕒</span>
          <div className="card-info">
            <span className="card-label">Attendance Status</span>
            <span className="card-value">{todayLog ? todayLog.attendance_status : 'Absent'}</span>
          </div>
        </div>
        <div className="stats-card">
          <span className="card-icon">📥</span>
          <div className="card-info">
            <span className="card-label">Check In Time</span>
            <span className="card-value">{checkInDisp}</span>
          </div>
        </div>
        <div className="stats-card">
          <span className="card-icon">📤</span>
          <div className="card-info">
            <span className="card-label">Check Out Time</span>
            <span className="card-value">{checkOutDisp}</span>
          </div>
        </div>
        <div className="stats-card">
          <span className="card-icon">⚡</span>
          <div className="card-info">
            <span className="card-label">Working Hours</span>
            <span className="card-value">{todayLog?.working_hours ? `${todayLog.working_hours} hrs` : '0.00 hrs'}</span>
          </div>
        </div>
        <div className="stats-card">
          <span className="card-icon">🔥</span>
          <div className="card-info">
            <span className="card-label">Overtime Hours</span>
            <span className="card-value">{todayLog?.overtime_hours ? `${todayLog.overtime_hours} hrs` : '0.00 hrs'}</span>
          </div>
        </div>
        <div className="stats-card">
          <span className="card-icon">🌴</span>
          <div className="card-info">
            <span className="card-label">Leave Balance</span>
            <span className="card-value">{leaveBalance} days</span>
          </div>
        </div>
        <div className="stats-card">
          <span className="card-icon">📈</span>
          <div className="card-info">
            <span className="card-label">Month Attendance</span>
            <span className="card-value">{attendancePercentage}%</span>
          </div>
        </div>
      </div>

      {/* Main Dash Middle section */}
      <div className="dash-middle-section">
        {/* Charts & Actions */}
        <div className="dash-charts-actions-col">
          <div className="dashboard-sub-card">
            <h3>Weekly Working Hours Chart</h3>
            <div className="custom-bar-chart">
              {weeklyHoursData.map((d, index) => {
                const heightPercentage = Math.min(100, (d.hours / 12) * 100);
                return (
                  <div key={index} className="chart-bar-container">
                    <div className="chart-bar-value">{d.hours}h</div>
                    <div 
                      className="chart-bar-fill" 
                      style={{ height: `${heightPercentage}%` }}
                    />
                    <div className="chart-bar-label">{d.day}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="dashboard-sub-card">
            <h3>Quick Actions</h3>
            <div className="actions-buttons-grid">
              <button onClick={() => navigate('/employee/leave')} className="quick-action-btn">
                📝 Apply Leave
              </button>
              <button onClick={() => navigate('/employee/payroll')} className="quick-action-btn">
                💵 View Payroll
              </button>
              <button onClick={() => navigate('/employee/profile')} className="quick-action-btn">
                👤 Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Holidays & Notifications */}
        <div className="dash-secondary-col">
          <div className="dashboard-sub-card">
            <h3>Upcoming Holidays</h3>
            <ul className="holidays-list">
              {upcomingHolidays.map((h, i) => (
                <li key={i} className="holiday-item">
                  <span className="holiday-date">{h.date}</span>
                  <span className="holiday-name">{h.name}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="dashboard-sub-card">
            <h3>Recent Announcements</h3>
            <div className="notifications-preview-list">
              {notifications.length === 0 ? (
                <p className="no-notify-text">No announcements available.</p>
              ) : (
                notifications.map((n) => (
                  <div key={n.notification_id} className="notify-preview-item">
                    <span className="notify-title">{n.title}</span>
                    <p className="notify-text">{n.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Attendance Log Table */}
      <div className="dashboard-sub-card recent-attendance-table-card">
        <h3>Recent Attendance Log</h3>
        <div className="table-responsive">
          <table className="hrms-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Working Hours</th>
                <th>Overtime</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center' }}>No attendance logged.</td>
                </tr>
              ) : (
                attendance.slice(0, 5).map((log) => (
                  <tr key={log.attendance_id}>
                    <td>{new Date(log.attendance_date).toLocaleDateString()}</td>
                    <td>{log.check_in_time ? new Date(log.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</td>
                    <td>{log.check_out_time ? new Date(log.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</td>
                    <td>{log.working_hours ? `${log.working_hours} hrs` : '0.00'}</td>
                    <td>{log.overtime_hours ? `${log.overtime_hours} hrs` : '0.00'}</td>
                    <td>
                      <span className={`status-badge ${log.attendance_status.toLowerCase()}`}>
                        {log.attendance_status}
                      </span>
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

export default EmployeeDashboard;
