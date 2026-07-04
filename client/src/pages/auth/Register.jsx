import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { NotificationContext } from '../../context/NotificationContext';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const notify = useContext(NotificationContext);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Employee');
  const [designation, setDesignation] = useState('Software Engineer');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await authService.register({
        name,
        email,
        password,
        role,
        designation,
        phone: '555-0150',
        address: 'HQ Office',
        salary: 60000.00
      });
      notify?.showNotification('Account registered successfully! Please log in.', 'success');
      navigate('/login');
    } catch (err) {
      notify?.showNotification(err.message || 'Registration failed', 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-page">
      <h2>Create Account</h2>
      <p>Register a new HRMS workspace login</p>
      
      <form onSubmit={handleSubmit} className="register-form">
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input 
            type="text" 
            className="form-input" 
            placeholder="Jane Doe" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required 
            disabled={isSubmitting}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input 
            type="email" 
            className="form-input" 
            placeholder="jane@company.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
            disabled={isSubmitting}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input 
            type="password" 
            className="form-input" 
            placeholder="••••••••" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
            disabled={isSubmitting}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Desired Role</label>
          <select 
            className="form-input" 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
            disabled={isSubmitting}
          >
            <option value="Employee">Employee</option>
            <option value="Admin">Admin / HR</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Designation</label>
          <input 
            type="text" 
            className="form-input" 
            placeholder="e.g. Software Engineer" 
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            required 
            disabled={isSubmitting}
          />
        </div>
        <button type="submit" className="register-submit-btn" disabled={isSubmitting}>
          {isSubmitting ? 'Registering...' : 'Register Account'}
        </button>
      </form>

      <div className="register-footer">
        <Link to="/login" className="back-login-link">Already have an account? Log In</Link>
      </div>
    </div>
  );
};

export default Register;
