import React, { useState, useEffect, useContext } from 'react';
import { NotificationContext } from '../../context/NotificationContext';
import api from '../../services/api';
import './LeaveManagement.css';

const LeaveManagement = () => {
  const notify = useContext(NotificationContext);

  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  
  // Rejection modal control
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [targetLeaveId, setTargetLeaveId] = useState(null);
  const [rejectComment, setRejectComment] = useState('');
  
  const [processing, setProcessing] = useState(false);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/leaves');
      if (res.success) {
        setRequests(res.data);
      }
    } catch (err) {
      console.error(err);
      notify?.showNotification('Failed to retrieve leave request files', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleApprove = async (leaveId) => {
    if (!window.confirm('Are you sure you want to approve this leave request?')) {
      return;
    }

    setProcessing(true);
    try {
      const res = await api.patch(`/admin/leaves/${leaveId}/approve`);
      if (res.success) {
        notify?.showNotification('Leave request approved', 'success');
        fetchLeaves();
      }
    } catch (err) {
      notify?.showNotification(err.message || 'Approval failed', 'danger');
    } finally {
      setProcessing(false);
    }
  };

  const handleOpenReject = (leaveId) => {
    setTargetLeaveId(leaveId);
    setRejectComment('');
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectComment.trim()) {
      notify?.showNotification('Please add rejection remarks', 'warning');
      return;
    }

    setProcessing(true);
    try {
      const res = await api.patch(`/admin/leaves/${targetLeaveId}/reject`, {
        adminComment: rejectComment
      });

      if (res.success) {
        notify?.showNotification('Leave request rejected', 'success');
        setShowRejectModal(false);
        fetchLeaves();
      }
    } catch (err) {
      notify?.showNotification(err.message || 'Rejection failed', 'danger');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="leave-mgmt-page">
      <div className="mgmt-header">
        <h2>Leave Requests</h2>
        <p>Review leave applications, view reasons, and click to approve or reject requests.</p>
      </div>

      {loading ? (
        <div className="table-loading">Refreshing leave requests...</div>
      ) : (
        <div className="leave-requests-card">
          <div className="table-responsive">
            <table className="hrms-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Employee Name</th>
                  <th>Department</th>
                  <th>Leave Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Audited By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan="11" style={{ textAlign: 'center' }}>No leave requests found in system registry.</td>
                  </tr>
                ) : (
                  requests.map((r) => (
                    <tr key={r.leave_id}>
                      <td>LR-{r.leave_id}</td>
                      <td><strong>{r.full_name}</strong></td>
                      <td>{r.department_name || 'Unassigned'}</td>
                      <td>{r.leave_type}</td>
                      <td>{new Date(r.start_date).toLocaleDateString()}</td>
                      <td>{new Date(r.end_date).toLocaleDateString()}</td>
                      <td><strong>{r.number_of_days}</strong></td>
                      <td className="reason-td" title={r.reason}>{r.reason}</td>
                      <td>
                        <span className={`status-badge ${r.status.toLowerCase()}`}>
                          {r.status}
                        </span>
                      </td>
                      <td>{r.approved_by_name || '-'}</td>
                      <td>
                        {r.status === 'Pending' ? (
                          <div className="leave-actions-triggers">
                            <button 
                              onClick={() => handleApprove(r.leave_id)} 
                              className="approve-btn"
                              disabled={processing}
                            >
                              ✓ Approve
                            </button>
                            <button 
                              onClick={() => handleOpenReject(r.leave_id)} 
                              className="reject-btn"
                              disabled={processing}
                            >
                              ✗ Reject
                            </button>
                          </div>
                        ) : (
                          <span className="audited-placeholder">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {showRejectModal && (
        <div className="hrms-modal-overlay">
          <div className="hrms-modal-card">
            <div className="modal-header">
              <h3>Reject Leave Request</h3>
              <button className="close-modal-btn" onClick={() => setShowRejectModal(false)}>×</button>
            </div>

            <form onSubmit={handleRejectSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label">Rejection Remarks / Explanation</label>
                <textarea 
                  className="form-input"
                  value={rejectComment}
                  onChange={(e) => setRejectComment(e.target.value)}
                  placeholder="Explain why this request is being rejected..."
                  rows="4"
                  required
                  disabled={processing}
                />
              </div>

              <div className="modal-actions-footer">
                <button type="button" className="modal-cancel-btn" onClick={() => setShowRejectModal(false)} disabled={processing}>
                  Cancel
                </button>
                <button type="submit" className="modal-save-btn reject-submit-btn" disabled={processing}>
                  {processing ? 'Rejecting...' : 'Reject Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;
