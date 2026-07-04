import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { NotificationContext } from '../../context/NotificationContext';
import api from '../../services/api';
import './Profile.css';

const Profile = () => {
  const { employeeId } = useParams();
  const { user } = useContext(AuthContext);
  const notify = useContext(NotificationContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  
  // Tab Navigation state
  const [activeTab, setActiveTab] = useState('resume');

  // Form edit states
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [profileImage, setProfileImage] = useState('');
  
  // Private Info states
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  const [nationality, setNationality] = useState('Indian');
  const [personalEmail, setPersonalEmail] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccountNo, setBankAccountNo] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [pan, setPan] = useState('');
  const [uan, setUan] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');

  // Admin-only editable employment states
  const [fullName, setFullName] = useState('');
  const [designation, setDesignation] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [departments, setDepartments] = useState([]);

  // Salary Component states
  const [basicSalary, setBasicSalary] = useState(0);
  const [hraType, setHraType] = useState('percentage');
  const [hraValue, setHraValue] = useState(40);
  const [stdType, setStdType] = useState('percentage');
  const [stdValue, setStdValue] = useState(10);
  const [bonusType, setBonusType] = useState('fixed');
  const [bonusValue, setBonusValue] = useState(0);
  const [travelType, setTravelType] = useState('fixed');
  const [travelValue, setTravelValue] = useState(0);
  const [fixedType, setFixedType] = useState('fixed');
  const [fixedValue, setFixedValue] = useState(0);
  const [pfType, setPfType] = useState('percentage');
  const [pfValue, setPfValue] = useState(12);
  const [ptType, setPtType] = useState('fixed');
  const [ptValue, setPtValue] = useState(200);
  const [dedType, setDedType] = useState('fixed');
  const [dedValue, setDedValue] = useState(0);

  // Security tab states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Determine permissions
  const isHRAdmin = user?.role === 'admin' || user?.role === 'hr';
  const isSelf = !employeeId || employeeId === user?.employee_id;
  const isReadOnly = !isHRAdmin && !isSelf;

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      // Fetch departments list for dropdown
      if (isHRAdmin) {
        const deptRes = await api.get('/departments');
        if (deptRes.success) setDepartments(deptRes.data);
      }

      // Determine endpoint based on URL
      const url = employeeId ? `/employees/${employeeId}` : '/employee/profile';
      const res = await api.get(url);
      
      if (res.success && res.data) {
        const p = res.data;
        setProfile(p);
        
        // Map states
        setFullName(p.full_name || '');
        setPhone(p.phone || '');
        setAddress(p.address || '');
        setProfileImage(p.profile_image || '');
        setDob(p.dob ? new Date(p.dob).toISOString().substring(0, 10) : '');
        setGender(p.gender || 'Male');
        setNationality(p.nationality || 'Indian');
        setPersonalEmail(p.personal_email || '');
        setBankName(p.bank_name || '');
        setBankAccountNo(p.bank_account_no || '');
        setIfsc(p.ifsc || '');
        setPan(p.pan || '');
        setUan(p.uan || '');
        setEmergencyContact(p.emergency_contact || '');
        setDesignation(p.designation || '');
        setDepartmentId(p.department_id || '');

        // Salary parameters
        setBasicSalary(p.salary ? parseFloat(p.salary) : 0);
        setHraType(p.hra_type || 'percentage');
        setHraValue(p.hra_value ? parseFloat(p.hra_value) : 40);
        setStdType(p.standard_allowance_type || 'percentage');
        setStdValue(p.standard_allowance_value ? parseFloat(p.standard_allowance_value) : 10);
        setBonusType(p.performance_bonus_type || 'fixed');
        setBonusValue(p.performance_bonus_value ? parseFloat(p.performance_bonus_value) : 0);
        setTravelType(p.travel_allowance_type || 'fixed');
        setTravelValue(p.travel_allowance_value ? parseFloat(p.travel_allowance_value) : 0);
        setFixedType(p.fixed_allowance_type || 'fixed');
        setFixedValue(p.fixed_allowance_value ? parseFloat(p.fixed_allowance_value) : 0);
        setPfType(p.provident_fund_type || 'percentage');
        setPfValue(p.provident_fund_value ? parseFloat(p.provident_fund_value) : 12);
        setPtType(p.professional_tax_type || 'fixed');
        setPtValue(p.professional_tax_value ? parseFloat(p.professional_tax_value) : 200);
        setDedType(p.other_deductions_type || 'fixed');
        setDedValue(p.other_deductions_value ? parseFloat(p.other_deductions_value) : 0);
      }
    } catch (err) {
      console.error(err);
      notify?.showNotification('Failed to load profile details.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [employeeId]);

  // Live recalculation formulas
  const calculateComponent = (type, value, basic) => {
    if (type === 'percentage') {
      return (basic * (value / 100));
    }
    return parseFloat(value || 0);
  };

  const hraAmt = calculateComponent(hraType, hraValue, basicSalary);
  const stdAmt = calculateComponent(stdType, stdValue, basicSalary);
  const bonusAmt = calculateComponent(bonusType, bonusValue, basicSalary);
  const travelAmt = calculateComponent(travelType, travelValue, basicSalary);
  const fixedAmt = calculateComponent(fixedType, fixedValue, basicSalary);
  
  const grossSalary = basicSalary + hraAmt + stdAmt + bonusAmt + travelAmt + fixedAmt;

  const pfAmt = calculateComponent(pfType, pfValue, basicSalary);
  const ptAmt = calculateComponent(ptType, ptValue, basicSalary);
  const dedAmt = calculateComponent(dedType, dedValue, basicSalary);
  
  const totalDeductions = pfAmt + ptAmt + dedAmt;
  const netSalary = grossSalary - totalDeductions;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isReadOnly) return;

      let payload = {};

      if (isHRAdmin) {
        // Admin edits all details
        payload = {
          fullName,
          phone,
          address,
          profileImage,
          dob,
          gender,
          nationality,
          personalEmail,
          bankName,
          bankAccountNo,
          ifsc,
          pan,
          uan,
          emergencyContact,
          designation,
          departmentId: departmentId ? parseInt(departmentId) : null,
          salary: basicSalary,
          hraType,
          hraValue,
          standardAllowanceType: stdType,
          standardAllowanceValue: stdValue,
          performanceBonusType: bonusType,
          performanceBonusValue: bonusValue,
          travelAllowanceType: travelType,
          travelAllowanceValue: travelValue,
          fixedAllowanceType: fixedType,
          fixedAllowanceValue: fixedValue,
          providentFundType: pfType,
          providentFundValue: pfValue,
          professionalTaxType: ptType,
          professionalTaxValue: ptValue,
          otherDeductionsType: dedType,
          otherDeductionsValue: dedValue
        };
      } else {
        // Employee self update (only allows phone, address, profile_image)
        payload = {
          phone,
          address,
          profile_image: profileImage
        };
      }

      const url = employeeId ? `/employees/${employeeId}` : '/employee/profile';
      const res = employeeId ? await api.put(url, payload) : await api.patch(url, payload);
      
      if (res.success) {
        notify?.showNotification('Profile updated successfully.', 'success');
        fetchProfileData();
      } else {
        notify?.showNotification(res.message || 'Update failed.', 'danger');
      }
    } catch (err) {
      console.error(err);
      notify?.showNotification(err.message || 'Error saving changes.', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      notify?.showNotification('Passwords do not match.', 'warning');
      return;
    }
    setSaving(true);
    try {
      const res = await api.patch('/employee/profile', { newPassword });
      if (res.success) {
        notify?.showNotification('Password updated successfully.', 'success');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        notify?.showNotification(res.message || 'Update failed.', 'danger');
      }
    } catch (err) {
      console.error(err);
      notify?.showNotification(err.message || 'Failed to update credentials.', 'danger');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="profile-loading">Compiling file ledger...</div>;
  }

  const userInitials = fullName
    ? fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'EE';

  return (
    <div className="profile-page-container">
      {profile && (
        <div className="profile-grid-layout">
          {/* Left Panel Card */}
          <div className="profile-left-panel">
            <div className="avatar-section">
              {profileImage ? (
                <img src={profileImage} alt={fullName} className="panel-avatar-img" />
              ) : (
                <div className="panel-avatar-placeholder">{userInitials}</div>
              )}
              {isSelf && (
                <input 
                  type="text" 
                  className="avatar-url-input" 
                  placeholder="Paste Avatar Image URL" 
                  value={profileImage}
                  onChange={(e) => setProfileImage(e.target.value)}
                />
              )}
            </div>

            <h3 className="panel-employee-name">{fullName}</h3>
            <span className="panel-designation">{designation || 'Staff'}</span>
            <span className="panel-dept">{profile.department_name || 'Unassigned'} Department</span>
            
            <div className="panel-meta-list">
              <div className="meta-item">
                <span>Joined:</span>
                <strong>{new Date(profile.joining_date).toLocaleDateString()}</strong>
              </div>
              <div className="meta-item">
                <span>Login ID:</span>
                <strong style={{ fontFamily: 'monospace' }}>{profile.employee_id}</strong>
              </div>
            </div>

            {/* Save Button for editable tabs */}
            {!isReadOnly && activeTab !== 'security' && (
              <button onClick={handleSave} className="panel-save-btn" disabled={saving}>
                {saving ? 'Saving...' : '💾 Save Profile'}
              </button>
            )}
          </div>

          {/* Right Panel Tabs */}
          <div className="profile-right-tabs-panel">
            <div className="tabs-header-navigation">
              <button 
                className={`tab-link ${activeTab === 'resume' ? 'active' : ''}`}
                onClick={() => setActiveTab('resume')}
              >
                📝 Resume
              </button>
              <button 
                className={`tab-link ${activeTab === 'private' ? 'active' : ''}`}
                onClick={() => setActiveTab('private')}
              >
                🔒 Private Info
              </button>
              {(isHRAdmin || isSelf) && (
                <button 
                  className={`tab-link ${activeTab === 'salary' ? 'active' : ''}`}
                  onClick={() => setActiveTab('salary')}
                >
                  💵 Salary Info
                </button>
              )}
              {isSelf && (
                <button 
                  className={`tab-link ${activeTab === 'security' ? 'active' : ''}`}
                  onClick={() => setActiveTab('security')}
                >
                  🛡️ Security
                </button>
              )}
            </div>

            <div className="tab-viewport-content">
              {/* TAB 1: RESUME */}
              {activeTab === 'resume' && (
                <div className="tab-pane-content">
                  <h4 className="pane-title">Professional Resume Timeline</h4>
                  <div className="resume-timeline">
                    <div className="timeline-node">
                      <div className="node-marker"></div>
                      <div className="node-info">
                        <h5>Joined {profile.company_name || 'Odoo India'}</h5>
                        <span className="node-date">{new Date(profile.joining_date).toLocaleDateString()}</span>
                        <p>Registered in corporate directory as {designation || 'Staff'} assigned to the {profile.department_name || 'Engineering'} Department.</p>
                      </div>
                    </div>
                    <div className="timeline-node">
                      <div className="node-marker border-node"></div>
                      <div className="node-info">
                        <h5>Undergraduate / Professional Program</h5>
                        <span className="node-date">Completed Prior to Joining</span>
                        <p>Certified degree credentials cleared and validated during enterprise onboarding.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PRIVATE INFORMATION */}
              {activeTab === 'private' && (
                <div className="tab-pane-content">
                  <h4 className="pane-title">Personal and Contact Records</h4>
                  <div className="fields-grid-2">
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        disabled={!isHRAdmin}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Date of Birth</label>
                      <input 
                        type="date" 
                        className="form-input" 
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        disabled={!isHRAdmin}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Gender</label>
                      <select 
                        className="form-input" 
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        disabled={!isHRAdmin}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Nationality</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={nationality}
                        onChange={(e) => setNationality(e.target.value)}
                        disabled={!isHRAdmin}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Corporate Email</label>
                      <input 
                        type="email" 
                        className="form-input" 
                        value={profile.email || ''}
                        disabled
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Personal Email</label>
                      <input 
                        type="email" 
                        className="form-input" 
                        value={personalEmail}
                        onChange={(e) => setPersonalEmail(e.target.value)}
                        disabled={!isHRAdmin}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        disabled={isReadOnly}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Emergency Contact Name/No.</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={emergencyContact}
                        onChange={(e) => setEmergencyContact(e.target.value)}
                        disabled={!isHRAdmin}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: '1rem' }}>
                    <label className="form-label">Residential Address</label>
                    <textarea 
                      className="form-input" 
                      rows="2"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      disabled={isReadOnly}
                    />
                  </div>

                  <h5 className="pane-subtitle-divider">Financial Verification Details</h5>
                  <div className="fields-grid-2">
                    <div className="form-group">
                      <label className="form-label">Bank Name</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        disabled={!isHRAdmin}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Account Number</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={bankAccountNo}
                        onChange={(e) => setBankAccountNo(e.target.value)}
                        disabled={!isHRAdmin}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Bank IFSC Code</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={ifsc}
                        onChange={(e) => setIfsc(e.target.value)}
                        disabled={!isHRAdmin}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Permanent Account Number (PAN)</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={pan}
                        onChange={(e) => setPan(e.target.value)}
                        disabled={!isHRAdmin}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Universal Account Number (UAN)</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={uan}
                        onChange={(e) => setUan(e.target.value)}
                        disabled={!isHRAdmin}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SALARY INFORMATION */}
              {activeTab === 'salary' && (isHRAdmin || isSelf) && (
                <div className="tab-pane-content">
                  <h4 className="pane-title">Configurable Contract Salary Ledger</h4>
                  
                  {/* Basic Salary edit row (Admin only) */}
                  <div className="form-group basic-salary-config-row">
                    <label className="form-label">Contracted Monthly Basic Salary</label>
                    <div className="basic-salary-input-wrapper">
                      <span className="currency-symbol">₹</span>
                      <input 
                        type="number" 
                        className="form-input basic-input" 
                        value={basicSalary}
                        onChange={(e) => setBasicSalary(parseFloat(e.target.value) || 0)}
                        disabled={!isHRAdmin}
                      />
                    </div>
                  </div>

                  <div className="salary-ledger-split-grid">
                    {/* Allowances section */}
                    <div className="ledger-section">
                      <h5>Allowance Components</h5>
                      
                      {/* HRA */}
                      <div className="component-row-config">
                        <span className="component-label">HRA:</span>
                        {isHRAdmin ? (
                          <div className="config-inputs">
                            <input type="number" className="val-input" value={hraValue} onChange={(e) => setHraValue(parseFloat(e.target.value) || 0)} />
                            <select value={hraType} onChange={(e) => setHraType(e.target.value)}>
                              <option value="percentage">%</option>
                              <option value="fixed">Amt</option>
                            </select>
                          </div>
                        ) : (
                          <span className="readonly-config-desc">{hraValue} {hraType === 'percentage' ? '%' : 'INR'}</span>
                        )}
                        <span className="computed-val">+₹{hraAmt.toFixed(2)}</span>
                      </div>

                      {/* Std Allowance */}
                      <div className="component-row-config">
                        <span className="component-label">Standard Allowance:</span>
                        {isHRAdmin ? (
                          <div className="config-inputs">
                            <input type="number" className="val-input" value={stdValue} onChange={(e) => setStdValue(parseFloat(e.target.value) || 0)} />
                            <select value={stdType} onChange={(e) => setStdType(e.target.value)}>
                              <option value="percentage">%</option>
                              <option value="fixed">Amt</option>
                            </select>
                          </div>
                        ) : (
                          <span className="readonly-config-desc">{stdValue} {stdType === 'percentage' ? '%' : 'INR'}</span>
                        )}
                        <span className="computed-val">+₹{stdAmt.toFixed(2)}</span>
                      </div>

                      {/* Travel Allowance */}
                      <div className="component-row-config">
                        <span className="component-label">Travel Allowance:</span>
                        {isHRAdmin ? (
                          <div className="config-inputs">
                            <input type="number" className="val-input" value={travelValue} onChange={(e) => setTravelValue(parseFloat(e.target.value) || 0)} />
                            <select value={travelType} onChange={(e) => setTravelType(e.target.value)}>
                              <option value="percentage">%</option>
                              <option value="fixed">Amt</option>
                            </select>
                          </div>
                        ) : (
                          <span className="readonly-config-desc">{travelValue} {travelType === 'percentage' ? '%' : 'INR'}</span>
                        )}
                        <span className="computed-val">+₹{travelAmt.toFixed(2)}</span>
                      </div>

                      {/* Performance Bonus */}
                      <div className="component-row-config">
                        <span className="component-label">Performance Bonus:</span>
                        {isHRAdmin ? (
                          <div className="config-inputs">
                            <input type="number" className="val-input" value={bonusValue} onChange={(e) => setBonusValue(parseFloat(e.target.value) || 0)} />
                            <select value={bonusType} onChange={(e) => setBonusType(e.target.value)}>
                              <option value="percentage">%</option>
                              <option value="fixed">Amt</option>
                            </select>
                          </div>
                        ) : (
                          <span className="readonly-config-desc">{bonusValue} {bonusType === 'percentage' ? '%' : 'INR'}</span>
                        )}
                        <span className="computed-val">+₹{bonusAmt.toFixed(2)}</span>
                      </div>

                      {/* Fixed Allowance */}
                      <div className="component-row-config">
                        <span className="component-label">Fixed Allowance:</span>
                        {isHRAdmin ? (
                          <div className="config-inputs">
                            <input type="number" className="val-input" value={fixedValue} onChange={(e) => setFixedValue(parseFloat(e.target.value) || 0)} />
                            <select value={fixedType} onChange={(e) => setFixedType(e.target.value)}>
                              <option value="percentage">%</option>
                              <option value="fixed">Amt</option>
                            </select>
                          </div>
                        ) : (
                          <span className="readonly-config-desc">{fixedValue} {fixedType === 'percentage' ? '%' : 'INR'}</span>
                        )}
                        <span className="computed-val">+₹{fixedAmt.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Deductions section */}
                    <div className="ledger-section">
                      <h5>Deduction Components</h5>

                      {/* Provident Fund */}
                      <div className="component-row-config">
                        <span className="component-label">Provident Fund (PF):</span>
                        {isHRAdmin ? (
                          <div className="config-inputs">
                            <input type="number" className="val-input" value={pfValue} onChange={(e) => setPfValue(parseFloat(e.target.value) || 0)} />
                            <select value={pfType} onChange={(e) => setPfType(e.target.value)}>
                              <option value="percentage">%</option>
                              <option value="fixed">Amt</option>
                            </select>
                          </div>
                        ) : (
                          <span className="readonly-config-desc">{pfValue} {pfType === 'percentage' ? '%' : 'INR'}</span>
                        )}
                        <span className="computed-val deduction-text">-₹{pfAmt.toFixed(2)}</span>
                      </div>

                      {/* Professional Tax */}
                      <div className="component-row-config">
                        <span className="component-label">Professional Tax (PT):</span>
                        {isHRAdmin ? (
                          <div className="config-inputs">
                            <input type="number" className="val-input" value={ptValue} onChange={(e) => setPtValue(parseFloat(e.target.value) || 0)} />
                            <select value={ptType} onChange={(e) => setPtType(e.target.value)}>
                              <option value="percentage">%</option>
                              <option value="fixed">Amt</option>
                            </select>
                          </div>
                        ) : (
                          <span className="readonly-config-desc">{ptValue} {ptType === 'percentage' ? '%' : 'INR'}</span>
                        )}
                        <span className="computed-val deduction-text">-₹{ptAmt.toFixed(2)}</span>
                      </div>

                      {/* Other Deductions */}
                      <div className="component-row-config">
                        <span className="component-label">Other Deductions:</span>
                        {isHRAdmin ? (
                          <div className="config-inputs">
                            <input type="number" className="val-input" value={dedValue} onChange={(e) => setDedValue(parseFloat(e.target.value) || 0)} />
                            <select value={dedType} onChange={(e) => setDedType(e.target.value)}>
                              <option value="percentage">%</option>
                              <option value="fixed">Amt</option>
                            </select>
                          </div>
                        ) : (
                          <span className="readonly-config-desc">{dedValue} {dedType === 'percentage' ? '%' : 'INR'}</span>
                        )}
                        <span className="computed-val deduction-text">-₹{dedAmt.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Calculations breakdown banner */}
                  <div className="salary-calculation-card-summary">
                    <div className="summary-field">
                      <span>Gross Salary:</span>
                      <strong>₹{grossSalary.toFixed(2)}</strong>
                    </div>
                    <div className="summary-field">
                      <span>Total Deductions:</span>
                      <strong className="deduction-text">₹{totalDeductions.toFixed(2)}</strong>
                    </div>
                    <div className="summary-field net-salary-field">
                      <span>Net Monthly Salary:</span>
                      <strong className="net-badge">₹{netSalary.toFixed(2)}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: SECURITY TAB */}
              {activeTab === 'security' && isSelf && (
                <div className="tab-pane-content">
                  <h4 className="pane-title">Account Security Management</h4>
                  <form onSubmit={handlePasswordChange} className="password-update-form">
                    <div className="form-group">
                      <label className="form-label">New Password</label>
                      <input 
                        type="password"
                        className="form-input"
                        placeholder="Min 8 characters, numbers & symbols"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        disabled={saving}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Confirm New Password</label>
                      <input 
                        type="password"
                        className="form-input"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={saving}
                      />
                    </div>
                    <button type="submit" className="panel-save-btn" disabled={saving}>
                      {saving ? 'Saving...' : '🔒 Change Password'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
