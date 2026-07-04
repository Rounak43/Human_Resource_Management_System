import React, { useState, useEffect, useContext } from 'react';
import { NotificationContext } from '../../context/NotificationContext';
import api from '../../services/api';
import './Leave.css';

const Leave = () => {
  const notify = useContext(NotificationContext);

  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [leaveType, setLeaveType] = useState('Paid Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchLeaveHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/leave/history');
      if (res.success) {
        setHistory(res.data);
      }
    } catch (err) {
      console.error(err);
      notify?.showNotification('Failed to fetch leave history', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveHistory();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const sDate = new Date(startDate);
    const eDate = new Date(endDate);
    if (eDate < sDate) {
      notify?.showNotification('End date cannot be prior to start date', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/leave/apply', {
        leaveType,
        startDate,
        endDate,
        remarks,
        attachmentUrl
      });

      if (res.success) {
        notify?.showNotification('Leave application submitted successfully!', 'success');
        setStartDate('');
        setEndDate('');
        setRemarks('');
        setAttachmentUrl('');
        fetchLeaveHistory();
      }
    } catch (err) {
      console.error(err);
      notify?.showNotification(err.message || 'Failed to submit leave request', 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  const leaveTypes = ['Paid Leave', 'Sick Leave', 'Unpaid Leave'];

  return (
    <div className="leave-page-container">
      <div className="leave-header">
        <h2>Leave Management</h2>
        <p>Apply for leaves and track your approval status history.</p>
      </div>

      <div className="leave-content-grid">
        {/* Leave application form */}
        <div className="leave-form-card">
          <h3>Apply for Leave</h3>
          <form onSubmit={handleSubmit} className="leave-form">
            <div className="form-group">
              <label className="form-label">Leave Type</label>
              <select 
                value={leaveType} 
                onChange={(e) => setLeaveType(e.target.value)}
                className="form-input select-input"
                required
              >
                {leaveTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div className="form-dates-row">
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)}
                  className="form-input" 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">End Date</label>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)}
                  className="form-input" 
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Upload Proof Attachment URL (Optional)</label>
              <input 
                type="text" 
                placeholder="Paste document link/image URL"
                value={attachmentUrl}
                onChange={(e) => setAttachmentUrl(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Reason / Remarks</label>
              <textarea 
                value={remarks} 
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Explain the reason for leave request..."
                rows="3"
                className="form-input textarea-input"
                required
              />
            </div>

            <button type="submit" className="leave-submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting request...' : 'Submit Application'}
            </button>
          </form>
        </div>

        {/* Leave History logs */}
        <div className="leave-history-card">
          <h3>Leave History & Status</h3>
          {loading ? (
            <div className="history-loading">Fetching leave records...</div>
          ) : (
            <div className="leave-history-list">
              {history.length === 0 ? (
                <div className="no-history-box">No leave history found.</div>
              ) : (
                history.map((request) => (
                  <div key={request.leave_id} className="leave-history-item">
                    <div className="item-header">
                      <strong className="leave-type-label">{request.leave_type}</strong>
                      <span className={`status-badge ${request.status.toLowerCase()}`}>
                        {request.status}
                      </span>
                    </div>
                    <div className="item-details">
                      <div className="item-meta">
                        📅 <span>{new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}</span>
                        <span className="days-count">({request.number_of_days} {request.number_of_days === 1 ? 'day' : 'days'})</span>
                      </div>
                      <p className="item-reason"><strong>Reason:</strong> {request.reason}</p>
                      
                      {request.attachment_url && (
                        <p className="item-attachment">
                          📎 <strong>Attachment:</strong>{' '}
                          <a href={request.attachment_url} target="_blank" rel="noopener noreferrer" className="att-link">
                            View Document File
                          </a>
                        </p>
                      )}

                      {request.remarks && (
                        <p className="item-remarks"><strong>Admin Remarks:</strong> {request.remarks}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leave;
