import { useState, useContext } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import { NotificationContext } from '../../context/NotificationContext';
import './AuthPage.css';

const DEPARTMENTS = [
  'Engineering',
  'Human Resources',
  'Finance',
  'Marketing',
  'Sales',
  'Operations'
];

const DESIGNATIONS = [
  'Software Engineer',
  'QA Engineer',
  'HR Specialist',
  'HR Manager',
  'Financial Analyst',
  'Marketing Executive',
  'Sales Representative',
  'Operations Coordinator'
];

const AuthPage = () => {
  const { login } = useAuth();
  const { showNotification } = useContext(NotificationContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active state based on route path
  const isSignUp = location.pathname === '/register';

  // Loading indicator for API calls
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sign In Form States
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Sign Up Form States
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpDept, setSignUpDept] = useState(DEPARTMENTS[0]);
  const [signUpDesignation, setSignUpDesignation] = useState(DESIGNATIONS[0]);

  // Handle Sign In submission
  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    if (!signInEmail || !signInPassword) {
      showNotification('Please fill in all fields', 'warning');
      return;
    }

    // Basic Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signInEmail)) {
      showNotification('Please enter a valid email address', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await login(signInEmail, signInPassword);
      showNotification(`Welcome back, ${user.name}!`, 'success');
      
      // Redirect based on role
      if (user.role === 'admin' || user.role === 'hr') {
        navigate('/admin/dashboard');
      } else {
        navigate('/employee/dashboard');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Login error:', error);
      const errorMsg = error.message || 'Invalid email or password. Please try again.';
      showNotification(errorMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Sign Up submission
  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    if (!signUpName || !signUpEmail || !signUpPassword || !signUpPhone) {
      showNotification('Please fill in all required fields', 'warning');
      return;
    }

    // Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signUpEmail)) {
      showNotification('Please enter a valid email address', 'warning');
      return;
    }

    if (signUpPassword.length < 6) {
      showNotification('Password must be at least 6 characters long', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: signUpName,
        email: signUpEmail,
        password: signUpPassword,
        role: 'employee', // Default role for self-registered accounts
        phone: signUpPhone,
        department: signUpDept,
        designation: signUpDesignation,
        salary: 0.00 // Default scaffolded salary
      };

      await authService.register(payload);
      showNotification('Account created successfully! Please sign in.', 'success');
      
      // Clear sign-up form
      setSignUpName('');
      setSignUpEmail('');
      setSignUpPassword('');
      setSignUpPhone('');
      
      // Transition to sign in
      navigate('/login');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Registration error:', error);
      const errorMsg = error.message || 'Registration failed. Email might already exist.';
      showNotification(errorMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-portal-page">
      {/* Premium Header */}
      <header className="auth-portal-header">
        <h1>HUMAN RESOURCE MANAGEMENT SYS</h1>
        <p className="subtitle">Enterprise Portal</p>
      </header>

      {/* Sliding Auth Container */}
      <div className={`cont ${isSignUp ? 's--signup' : ''}`}>
        
        {/* Sign In Form */}
        <div className="form sign-in">
          <h2>Welcome Back</h2>
          <p className="form-sub-heading">Sign in to manage your workplace details</p>
          <form onSubmit={handleSignInSubmit}>
            <label>
              <span>Email</span>
              <input 
                type="email" 
                value={signInEmail} 
                onChange={(e) => setSignInEmail(e.target.value)} 
                required 
                disabled={isSubmitting}
                placeholder="you@company.com"
              />
            </label>
            <label>
              <span>Password</span>
              <input 
                type="password" 
                value={signInPassword} 
                onChange={(e) => setSignInPassword(e.target.value)} 
                required 
                disabled={isSubmitting}
                placeholder="••••••••"
              />
            </label>
            <Link to="/forgot-password" className="forgot-pass">Forgot password?</Link>
            <button type="submit" className="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
          <p className="mobile-toggle-text">
            {"Don't have an account? "}
            <span onClick={() => navigate('/register')}>Sign Up</span>
          </p>
        </div>

        {/* Sliding Panel Layer */}
        <div className="sub-cont">
          <div className="img">
            <div className="img__text m--up">
              <h3>{"Don't have an account?"}</h3>
              <p>Please register to create your employee profile.</p>
            </div>
            <div className="img__text m--in">
              <h3>Already have an account?</h3>
              <p>Just sign in to access your dashboard.</p>
            </div>
            <div className="img__btn" onClick={() => navigate(isSignUp ? '/login' : '/register')}>
              <span className="m--up">Sign Up</span>
              <span className="m--in">Sign In</span>
            </div>
          </div>

          {/* Sign Up Form */}
          <div className="form sign-up">
            <h2>Create your Account</h2>
            <p className="form-sub-heading">Register your new employee profile</p>
            <form onSubmit={handleSignUpSubmit}>
              <div className="signup-grid">
                <label>
                  <span>Full Name</span>
                  <input 
                    type="text" 
                    value={signUpName} 
                    onChange={(e) => setSignUpName(e.target.value)} 
                    required 
                    disabled={isSubmitting}
                    placeholder="John Doe"
                  />
                </label>
                <label>
                  <span>Email</span>
                  <input 
                    type="email" 
                    value={signUpEmail} 
                    onChange={(e) => setSignUpEmail(e.target.value)} 
                    required 
                    disabled={isSubmitting}
                    placeholder="john@company.com"
                  />
                </label>
                <label>
                  <span>Password</span>
                  <input 
                    type="password" 
                    value={signUpPassword} 
                    onChange={(e) => setSignUpPassword(e.target.value)} 
                    required 
                    disabled={isSubmitting}
                    placeholder="At least 6 chars"
                  />
                </label>
                <label>
                  <span>Phone Number</span>
                  <input 
                    type="tel" 
                    value={signUpPhone} 
                    onChange={(e) => setSignUpPhone(e.target.value)} 
                    required 
                    disabled={isSubmitting}
                    placeholder="e.g. +123456789"
                  />
                </label>
                <label>
                  <span>Department</span>
                  <select 
                    value={signUpDept} 
                    onChange={(e) => setSignUpDept(e.target.value)}
                    disabled={isSubmitting}
                    className="select-input"
                  >
                    {DEPARTMENTS.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Designation</span>
                  <select 
                    value={signUpDesignation} 
                    onChange={(e) => setSignUpDesignation(e.target.value)}
                    disabled={isSubmitting}
                    className="select-input"
                  >
                    {DESIGNATIONS.map(desig => (
                      <option key={desig} value={desig}>{desig}</option>
                    ))}
                  </select>
                </label>
              </div>
              <button type="submit" className="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating Profile...' : 'Sign Up'}
              </button>
            </form>
            <p className="mobile-toggle-text">
              Already have an account?{' '}
              <span onClick={() => navigate('/login')}>Sign In</span>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AuthPage;
