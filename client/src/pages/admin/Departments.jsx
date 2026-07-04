import React, { useState, useEffect, useContext } from 'react';
import { NotificationContext } from '../../context/NotificationContext';
import api from '../../services/api';
import './Departments.css';

const Departments = () => {
  const notify = useContext(NotificationContext);

  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);

  // Modal Control
  const [showModal, setShowModal] = useState(false);
  const [deptName, setDeptName] = useState('');
  const [managerId, setManagerId] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/departments');
      if (res.success) {
        setDepartments(res.data);
      }

      const empRes = await api.get('/admin/employees');
      if (empRes.success) {
        setEmployees(empRes.data);
        if (empRes.data.length > 0) setManagerId(empRes.data[0].employee_id);
      }
    } catch (err) {
      console.error(err);
      notify?.showNotification('Failed to fetch departments list', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setDeptName('');
    if (employees.length > 0) setManagerId(employees[0].employee_id);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!deptName.trim()) {
      notify?.showNotification('Please enter a department name', 'warning');
      return;
    }

    setSaving(true);
    try {
      const res = await api.post('/departments', {
        department_name: deptName,
        manager_id: managerId ? parseInt(managerId) : null
      });

      if (res.success) {
        notify?.showNotification('New department registered successfully!', 'success');
        setShowModal(false);
        loadData();
      }
    } catch (err) {
      console.error(err);
      notify?.showNotification(err.message || 'Creation failed', 'danger');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="departments-mgmt-page">
      <div className="mgmt-header">
        <div>
          <h2>Organizational Sectors</h2>
          <p>Supervise business units, assign department managers, and review headcounts.</p>
        </div>
        <button onClick={handleOpenAdd} className="add-dept-btn">
          ➕ Register New Sector
        </button>
      </div>

      {loading ? (
        <div className="list-loading">Refreshing sectors directory...</div>
      ) : (
        <div className="departments-grid">
          {departments.map((dept) => {
            // Calculate employee headcount in this department
            const headcount = employees.filter(e => e.department_id === dept.department_id).length;
            
            return (
              <div key={dept.department_id} className="dept-overview-card">
                <div className="dept-icon-circle">🏢</div>
                <h3 className="dept-title-name">{dept.department_name}</h3>
                <span className="dept-manager-tag">
                  Manager: <strong>{dept.manager_name || 'Unassigned'}</strong>
                </span>
                <hr className="dept-divider" />
                <div className="dept-stats-row">
                  <span>Headcount:</span>
                  <strong>{headcount} employees</strong>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE MODAL */}
      {showModal && (
        <div className="hrms-modal-overlay">
          <div className="hrms-modal-card">
            <div className="modal-header">
              <h3>Register New Department</h3>
              <button className="close-modal-btn" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label">Department / Sector Name</label>
                <input 
                  type="text" 
                  className="form-input"
                  placeholder="e.g. Quality Assurance"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  required
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Designated Manager</label>
                <select 
                  value={managerId}
                  onChange={(e) => setManagerId(e.target.value)}
                  className="form-input"
                  disabled={saving}
                >
                  <option value="">No Manager Assigned</option>
                  {employees.map(emp => (
                    <option key={emp.employee_id} value={emp.employee_id}>
                      {emp.full_name} (EMP-{emp.employee_id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-actions-footer">
                <button type="button" className="modal-cancel-btn" onClick={() => setShowModal(false)} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="modal-save-btn" disabled={saving}>
                  {saving ? 'Creating...' : 'Register Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;
