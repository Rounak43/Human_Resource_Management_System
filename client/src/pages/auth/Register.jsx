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
  const [companyName, setCompanyName] = useState('');
  const [companyLogo, setCompanyLogo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await authService.register({
        name,
        email,
        password,
        companyName,
        companyLogo,
        designation: 'CEO & Founder'
      });
      notify?.showNotification('Company Workspace and Administrator account initialized successfully! Please log in.', 'success');
      navigate('/login');
    } catch (err) {
      notify?.showNotification(err.message || 'Registration failed. Bootstrap already initialized.', 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-page">
      <h2>Bootstrap HRMS Workspace</h2>
      <p>Only the first company administrator should register using this page to initialize the workspace directory.</p>
      
      <div className="register-info-alert">
        ℹ️ Public registration will be disabled immediately after workspace setup. Employees must be added manually by Admin/HR.
      </div>

      <form onSubmit={handleSubmit} className="register-form">
        <div className="form-group">
          <label className="form-label">Company Name</label>
          <input 
            type="text" 
            className="form-input" 
            placeholder="e.g. Odoo India" 
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required 
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Company Logo Image URL (Optional)</label>
          <input 
            type="text" 
            className="form-input" 
            placeholder="https://company.com/logo.png" 
            value={companyLogo}
            onChange={(e) => setCompanyLogo(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <hr className="register-divider" />
        <h4 className="admin-form-heading">First Administrator Details</h4>

        <div className="form-group">
          <label className="form-label">Administrator Full Name</label>
          <input 
            type="text" 
            className="form-input" 
            placeholder="e.g. John Doe" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required 
            disabled={isSubmitting}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Administrator Email Address</label>
          <input 
            type="email" 
            className="form-input" 
            placeholder="admin@company.com" 
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

        <button type="submit" className="register-submit-btn" disabled={isSubmitting}>
          {isSubmitting ? 'Initializing Workspace...' : 'Initialize Workspace'}
        </button>
      </form>

      <div className="register-footer">
        <Link to="/login" className="back-login-link">Already have an account? Log In</Link>
      </div>
    </div>
  );
};

export default Register;
