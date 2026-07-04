/**
 * Custom request body validation middleware for employee operations
 */

export const validateEmployeeCreate = (req, res, next) => {
  const { firstName, lastName, joiningDate, departmentId, role, companyName, email, phone } = req.body;

  // 1. Required field checks
  if (!firstName || !firstName.trim()) {
    return res.status(400).json({ success: false, message: 'First Name is required.' });
  }
  if (!lastName || !lastName.trim()) {
    return res.status(400).json({ success: false, message: 'Last Name is required.' });
  }
  if (!joiningDate) {
    return res.status(400).json({ success: false, message: 'Joining Date is required.' });
  }
  if (!departmentId) {
    return res.status(400).json({ success: false, message: 'Department is required.' });
  }
  if (!role) {
    return res.status(400).json({ success: false, message: 'Role is required.' });
  }
  if (!companyName || !companyName.trim()) {
    return res.status(400).json({ success: false, message: 'Company Name is required.' });
  }
  if (!email || !email.trim()) {
    return res.status(400).json({ success: false, message: 'Email address is required.' });
  }

  // 2. Email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Invalid email address format.' });
  }

  // 3. Phone format check (if phone number is supplied)
  if (phone) {
    const phoneRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ success: false, message: 'Invalid phone number format.' });
    }
  }

  next();
};

export const validateEmployeeUpdate = (req, res, next) => {
  const { phone } = req.body;
  if (phone) {
    const phoneRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ success: false, message: 'Invalid phone number format.' });
    }
  }
  next();
};
