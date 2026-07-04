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

  // Success credentials modal control
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdEmpId, setCreatedEmpId] = useState('');
  const [createdTempPassword, setCreatedTempPassword] = useState('');

  // Predefined job titles
  const predefinedTitles = [
    'Software Engineer',
    'Senior Software Engineer',
    'QA Automation Engineer',
    'Product Manager',
    'UX/UI Designer',
    'HR Specialist',
    'HR Manager',
    'HR Director',
    'Finance Analyst',
    'Finance Manager',
    'Marketing Associate',
    'Marketing Manager',
    'IT Support Engineer',
    'System Administrator',
    'Customer Success Specialist',
    'Operations Executive'
  ];

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Employee');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [designation, setDesignation] = useState(predefinedTitles[0]);
  const [salary, setSalary] = useState('');
  const [companyName, setCompanyName] = useState('Odoo India');
  const [joiningDate, setJoiningDate] = useState(() => new Date().toISOString().substring(0, 10));
  
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch employees list
      const empRes = await api.get('/employees');
      if (empRes.success) setEmployees(empRes.data);

      const deptRes = await api.get('/departments');
      if (deptRes.success) {
        setDepartments(deptRes.data);
        if (deptRes.data.length > 0 && !departmentId) {
          setDepartmentId(deptRes.data[0].department_id);
        }
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
    setFirstName('');
    setLastName('');
    setEmail('');
    setRole('Employee');
    setPhone('');
    setAddress('');
    setDesignation(predefinedTitles[0]);
    setSalary('');
    setCompanyName('Odoo India');
    setJoiningDate(new Date().toISOString().substring(0, 10));
    
    if (departments.length > 0) {
      setDepartmentId(departments[0].department_id);
    }
    setShowModal(true);
  };

  const handleOpenEdit = (empId) => {
    const emp = employees.find(e => e.employee_id === empId);
    if (!emp) return;

    setModalMode('edit');
    setTargetEmpId(empId);

    // Split name for edit mode input mapping
    const nameParts = (emp.full_name || '').split(' ');
    setFirstName(nameParts[0] || '');
    setLastName(nameParts.slice(1).join(' ') || '');
    
    setEmail(emp.email || '');
    setPhone(emp.phone || '');
    setAddress(emp.address || '');
    setDepartmentId(emp.department_id || '');
    setDesignation(emp.designation || predefinedTitles[0]);
    setSalary(emp.salary || '');
    setCompanyName(emp.company_name || 'Odoo India');
    setJoiningDate(new Date(emp.joining_date).toISOString().substring(0, 10));
    setShowModal(true);
  };

  const handleDelete = async (empId) => {
    if (!window.confirm('Are you sure you want to delete this employee? This will permanently erase their login and profile details.')) {
      return;
    }

    try {
      const res = await api.delete(`/employees/${empId}`);
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
        firstName,
        lastName,
        joiningDate,
        departmentId: departmentId ? parseInt(departmentId) : null,
        role,
        companyName,
        email,
        phone,
        address,
        designation,
        salary: salary ? parseFloat(salary) : 0
      };

      if (modalMode === 'add') {
        const res = await api.post('/employees', payload);
        if (res.success) {
          notify?.showNotification('Employee added successfully!', 'success');
          setShowModal(false);
          
          // Display the generated login credentials to the admin
          setCreatedEmpId(res.data.employeeId);
          setCreatedTempPassword(res.data.temporaryPassword);
          setShowSuccessModal(true);

          loadData();
        }
      } else {
        // Edit payload format maps to update expectations
        const editPayload = {
          full_name: `${firstName} ${lastName}`,
          firstName,
          lastName,
          email,
          phone,
          address,
          department_id: departmentId ? parseInt(departmentId) : null,
          designation,
          salary: salary ? parseFloat(salary) : 0,
          companyName
        };

        const res = await api.put(`/employees/${targetEmpId}`, editPayload);
        if (res.success) {
          notify?.showNotification('Employee profile updated successfully', 'success');
          setShowModal(false);
          loadData();
        }
      }
    } catch (err) {
      console.error(err);
      notify?.showNotification(err.message || 'Saving employee profile failed', 'danger');
    } finally {
      setSaving(false);
    }
  };

  // Client-side search and department filters
  const filteredEmployees = employees.filter((emp) => {
    const matchSearch = emp.full_name.toLowerCase().includes(search.toLowerCase()) ||
                        emp.employee_id.toLowerCase().includes(search.toLowerCase()) ||
                        (emp.designation && emp.designation.toLowerCase().includes(search.toLowerCase()));
    
    const matchDept = deptFilter === '' || String(emp.department_id) === deptFilter;
    return matchSearch && matchDept;
  });

  // Create list of designation options (predefined + current custom if editing)
  const titleOptions = [...predefinedTitles];
  if (designation && !titleOptions.includes(designation)) {
    titleOptions.push(designation);
  }

  return (
    <div className="emp-management-page">
      <div className="emp-page-header">
        <div>
          <h2>Employee Directory & Management</h2>
          <p>Register new hires, correct employee profiles, and scale base contract details.</p>
        </div>
        <button onClick={handleOpenAdd} className="add-employee-btn">
          ➕ Register New Employee
        </button>
      </div>

      {/* Filter Options */}
      <div className="emp-filters-card">
        <input 
          type="text" 
          placeholder="Search by Employee ID, name, title..." 
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

      {/* Employees logs list */}
      <div className="emp-records-table-card">
        {loading ? (
          <div className="list-loading">Compiling corporate records directory...</div>
        ) : (
          <div className="table-responsive">
            <table className="hrms-table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Employee Name</th>
                  <th>Department</th>
                  <th>Designation / Title</th>
                  <th>Phone Number</th>
                  <th>Joining Date</th>
                  <th>Monthly Salary</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center' }}>No employee profiles match search criteria.</td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp) => (
                    <tr key={emp.employee_id}>
                      <td style={{ fontWeight: '600' }}>{emp.employee_id}</td>
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
                      <td className="salary-col">₹{parseFloat(emp.salary).toLocaleString()}</td>
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
        )}
      </div>

      {/* CREATE / EDIT OVERLAY MODAL */}
      {showModal && (
        <div className="hrms-modal-overlay">
          <div className="hrms-modal-card">
            <div className="modal-header">
              <h3>{modalMode === 'add' ? 'Register New Corporate Employee' : 'Edit Employee Profile'}</h3>
              <button className="close-modal-btn" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required 
                    disabled={saving}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required 
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Email Address (Login Username)</label>
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
                  <label className="form-label">Joining Date</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={joiningDate}
                    onChange={(e) => setJoiningDate(e.target.value)}
                    required 
                    disabled={saving}
                  />
                </div>
              </div>

              {modalMode === 'add' && (
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Organization Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required 
                      disabled={saving}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Role Access Privilege</label>
                    <select 
                      value={role} 
                      onChange={(e) => setRole(e.target.value)}
                      className="form-input"
                      disabled={saving}
                      required
                    >
                      <option value="Employee">Employee</option>
                      <option value="Admin">Admin / HR Manager</option>
                    </select>
                  </div>
                </div>
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
                  <select 
                    className="form-input" 
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    disabled={saving}
                    required
                  >
                    {titleOptions.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
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

      {/* CREATION SUCCESS CREDENTIALS OVERLAY MODAL */}
      {showSuccessModal && (
        <div className="hrms-modal-overlay">
          <div className="hrms-modal-card success-card-banner">
            <div className="modal-header success-header">
              <h3>Employee account created successfully.</h3>
              <button className="close-modal-btn" onClick={() => setShowSuccessModal(false)}>×</button>
            </div>
            <div className="modal-form success-credentials-body">
              <p className="success-instruction">
                Please share the generated Employee ID and secure temporary password with the employee. They will be prompted to reset it on their first login session.
              </p>
              
              <div className="credential-row">
                <span>Employee Login ID:</span>
                <strong>{createdEmpId}</strong>
              </div>
              
              <div className="credential-row">
                <span>Temporary Password:</span>
                <strong className="temp-pwd">{createdTempPassword}</strong>
              </div>

              <button 
                onClick={() => setShowSuccessModal(false)} 
                className="modal-save-btn success-dismiss-btn"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;
