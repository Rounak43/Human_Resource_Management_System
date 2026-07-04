import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { NotificationContext } from '../../context/NotificationContext';
import api from '../../services/api';
import './EmployeeManagement.css';

const EmployeeManagement = () => {
  const location = useLocation();
  const notify = useContext(NotificationContext);

  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Search/Filters
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  // Modal control
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [targetEmpId, setTargetEmpId] = useState(null);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Employee');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [designation, setDesignation] = useState('');
  const [salary, setSalary] = useState('');
  
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const empRes = await api.get('/admin/employees');
      if (empRes.success) setEmployees(empRes.data);

      const deptRes = await api.get('/departments');
      if (deptRes.success) {
        setDepartments(deptRes.data);
        if (deptRes.data.length > 0) setDepartmentId(deptRes.data[0].department_id);
      }
    } catch (err) {
      console.error(err);
      notify?.showNotification('Failed to fetch corporate database files', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Listen to navigation state for quick-edit triggers
  useEffect(() => {
    if (employees.length > 0 && location.state?.editEmpId) {
      handleOpenEdit(location.state.editEmpId);
    }
  }, [location.state, employees]);

  const handleOpenAdd = () => {
    setModalMode('add');
    setFullName('');
    setEmail('');
    setPassword('');
    setRole('Employee');
    setPhone('');
    setAddress('');
    setDesignation('');
    setSalary('');
    if (departments.length > 0) setDepartmentId(departments[0].department_id);
    setShowModal(true);
  };

  const handleOpenEdit = (empId) => {
    const emp = employees.find(e => e.employee_id === empId);
    if (!emp) return;

    setModalMode('edit');
    setTargetEmpId(empId);
    setFullName(emp.full_name);
    setEmail(emp.email || '');
    setPassword(''); // keep blank
    setPhone(emp.phone || '');
    setAddress(emp.address || '');
    setDepartmentId(emp.department_id || '');
    setDesignation(emp.designation || '');
    setSalary(emp.salary || '');
    setShowModal(true);
  };

  const handleDelete = async (empId) => {
    if (!window.confirm('Are you sure you want to delete this employee? This will permanently erase their login and profile details.')) {
      return;
    }

    try {
      const res = await api.delete(`/admin/employees/${empId}`);
      if (res.success) {
        notify?.showNotification('Employee erased successfully', 'success');
        loadData();
      }
    } catch (err) {
      notify?.showNotification(err.message || 'Deletion failed', 'danger');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        full_name: fullName,
        phone,
        address,
        department_id: departmentId ? parseInt(departmentId) : null,
        designation,
        salary: salary ? parseFloat(salary) : 0
      };

      if (modalMode === 'add') {
        payload.email = email;
        payload.password = password || 'password123';
        payload.role = role;
        const res = await api.post('/admin/employees', payload);
        if (res.success) {
          notify?.showNotification('Employee added successfully!', 'success');
          setShowModal(false);
          loadData();
        }
      } else {
        const res = await api.put(`/admin/employees/${targetEmpId}`, payload);
        if (res.success) {
          notify?.showNotification('Employee details updated!', 'success');
          setShowModal(false);
          loadData();
        }
      }
    } catch (err) {
      console.error(err);
      notify?.showNotification(err.message || 'Saving employee failed', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchSearch = emp.full_name.toLowerCase().includes(search.toLowerCase()) ||
                        emp.designation.toLowerCase().includes(search.toLowerCase()) ||
                        (emp.email && emp.email.toLowerCase().includes(search.toLowerCase()));
    const matchDept = deptFilter === '' || String(emp.department_id) === deptFilter;
    return matchSearch && matchDept;
  });

  return (
    <div className="emp-management-page">
      <div className="emp-page-header">
        <div>
          <h2>Employee Files</h2>
          <p>Create, update, inspect, and delete employee profile profiles.</p>
        </div>
        <button onClick={handleOpenAdd} className="add-employee-btn">
          ➕ Register New Employee
        </button>
      </div>

      {/* Filters */}
      <div className="emp-filters-card">
        <input 
          type="text" 
          placeholder="Search by name, email, designation..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <select 
          value={deptFilter} 
          onChange={(e) => setDeptFilter(e.target.value)}
          className="dept-filter-select"
        >
          <option value="">All Departments</option>
          {departments.map(d => (
            <option key={d.department_id} value={d.department_id}>{d.department_name}</option>
          ))}
        </select>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="list-loading">Refreshing employee files...</div>
      ) : (
        <div className="emp-records-table-card">
          <div className="table-responsive">
            <table className="hrms-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Full Name</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Phone</th>
                  <th>Joined Date</th>
                  <th>Salary Config</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center' }}>No employees registered matching current filters.</td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp) => (
                    <tr key={emp.employee_id}>
                      <td>EMP-{emp.employee_id}</td>
                      <td>
                        <div className="name-email-col">
                          <strong>{emp.full_name}</strong>
                          <span>{emp.email}</span>
                        </div>
                      </td>
                      <td>{emp.department_name || 'Unassigned'}</td>
                      <td>{emp.designation || 'Staff'}</td>
                      <td>{emp.phone || '-'}</td>
                      <td>{new Date(emp.joining_date).toLocaleDateString()}</td>
                      <td className="salary-col">${parseFloat(emp.salary).toLocaleString()}</td>
                      <td>
                        <div className="actions-button-row">
                          <button onClick={() => handleOpenEdit(emp.employee_id)} className="edit-action-btn">
                            ✏️ Edit
                          </button>
                          <button onClick={() => handleDelete(emp.employee_id)} className="delete-action-btn">
                            🗑️ Delete
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
      )}

      {/* CRUD MODAL */}
      {showModal && (
        <div className="hrms-modal-overlay">
          <div className="hrms-modal-card">
            <div className="modal-header">
              <h3>{modalMode === 'add' ? 'Register New Employee' : 'Edit Employee Details'}</h3>
              <button className="close-modal-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required 
                  disabled={saving}
                />
              </div>

              {modalMode === 'add' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input 
                      type="email" 
                      className="form-input" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required 
                      disabled={saving}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Initial Password (defaults to password123)</label>
                    <input 
                      type="password" 
                      className="form-input" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="password123"
                      disabled={saving}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">System Access Role</label>
                    <select 
                      value={role} 
                      onChange={(e) => setRole(e.target.value)}
                      className="form-input"
                      disabled={saving}
                    >
                      <option value="Employee">Employee</option>
                      <option value="Admin">Admin / HR Manager</option>
                    </select>
                  </div>
                </>
              )}

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Contact Phone</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={saving}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Salary (Monthly Basic)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    required 
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Department Assignment</label>
                  <select 
                    value={departmentId} 
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="form-input"
                    disabled={saving}
                    required
                  >
                    {departments.map(d => (
                      <option key={d.department_id} value={d.department_id}>{d.department_name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Designation / Title</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    required 
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Residential Address</label>
                <textarea 
                  className="form-input" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows="2"
                  disabled={saving}
                />
              </div>

              <div className="modal-actions-footer">
                <button type="button" className="modal-cancel-btn" onClick={() => setShowModal(false)} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="modal-save-btn" disabled={saving}>
                  {saving ? 'Saving File...' : 'Save Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;
