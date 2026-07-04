import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { NotificationContext } from '../../context/NotificationContext';
import api from '../../services/api';
import './EmployeeDirectory.css';

const EmployeeDirectory = () => {
  const { user } = useContext(AuthContext);
  const notify = useContext(NotificationContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const empRes = await api.get('/employees');
      if (empRes.success) {
        setEmployees(empRes.data);
      }
      
      const deptRes = await api.get('/departments');
      if (deptRes.success) {
        setDepartments(deptRes.data);
      }
    } catch (err) {
      console.error(err);
      notify?.showNotification('Failed to load directory cards.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredEmployees = employees.filter(emp => {
    const matchSearch = emp.full_name.toLowerCase().includes(search.toLowerCase()) ||
                        emp.designation.toLowerCase().includes(search.toLowerCase()) ||
                        emp.employee_id.toLowerCase().includes(search.toLowerCase());
    const matchDept = selectedDept === '' || String(emp.department_id) === selectedDept;
    return matchSearch && matchDept;
  });

  const handleCardClick = (targetEmpId) => {
    const isHRAdmin = user?.role === 'admin' || user?.role === 'hr';
    if (isHRAdmin) {
      // Admin goes to profile view in Admin mode (fully editable)
      navigate(`/admin/profile/${targetEmpId}`);
    } else {
      // Standard employee
      if (user?.employee_id === targetEmpId) {
        // Own profile -> go to editable profile
        navigate('/employee/profile');
      } else {
        // Other employee profile -> go to read-only profile view
        navigate(`/employee/profile/${targetEmpId}`);
      }
    }
  };

  const getStatusIndicator = (status) => {
    switch (status) {
      case 'Present':
        return <span className="status-dot green-dot" title="Present">🟢</span>;
      case 'Leave':
        return <span className="status-dot blue-airplane" title="On Leave">✈️</span>; // Blue Airplane
      default:
        return <span className="status-dot yellow-dot" title="Absent">🟡</span>; // Yellow Dot
    }
  };

  return (
    <div className="directory-dashboard-container">
      <div className="directory-header-row">
        <div>
          <h2>Employee Workspace Directory</h2>
          <p>Click on any employee card to view their profile, details, and current status.</p>
        </div>
      </div>

      {/* Directory Filter controls */}
      <div className="directory-filters-card">
        <input 
          type="text" 
          placeholder="Search by ID, name, title..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <select 
          value={selectedDept} 
          onChange={(e) => setSelectedDept(e.target.value)}
          className="dept-filter-select"
        >
          <option value="">All Departments</option>
          {departments.map(d => (
            <option key={d.department_id} value={d.department_id}>{d.department_name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="list-loading">Compiling directory registry...</div>
      ) : (
        <div className="employee-cards-grid">
          {filteredEmployees.length === 0 ? (
            <p className="no-cards-msg">No employees found matching criteria.</p>
          ) : (
            filteredEmployees.map((emp) => {
              const nameInitials = emp.full_name
                ? emp.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                : 'EE';

              return (
                <div 
                  key={emp.employee_id} 
                  className="employee-directory-card"
                  onClick={() => handleCardClick(emp.employee_id)}
                >
                  <div className="card-avatar-wrapper">
                    {emp.profile_image ? (
                      <img src={emp.profile_image} alt={emp.full_name} className="card-avatar-img" />
                    ) : (
                      <div className="card-avatar-placeholder">{nameInitials}</div>
                    )}
                    <div className="card-status-badge">
                      {getStatusIndicator(emp.today_status)}
                    </div>
                  </div>

                  <h3 className="card-employee-name">{emp.full_name}</h3>
                  <span className="card-employee-id">{emp.employee_id}</span>
                  
                  <div className="card-details-row">
                    <span className="card-detail-label">Dept:</span>
                    <span className="card-detail-val">{emp.department_name || 'Unassigned'}</span>
                  </div>
                  <div className="card-details-row">
                    <span className="card-detail-label">Title:</span>
                    <span className="card-detail-val">{emp.designation || 'Staff'}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default EmployeeDirectory;
