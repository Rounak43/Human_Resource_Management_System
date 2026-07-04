-- Mock Seed Data for HRMS Testing

-- 1. Insert Users (Password: 'password123' bcrypt hashed value: '$2a$10$vK61u6LGsF3965vVf0vWp.vFexwG57Lp2D24lV4kG003d154.f52q')
INSERT INTO users (name, email, password, role) VALUES 
('HR Administrator', 'admin@hrms.com', '$2a$10$vK61u6LGsF3965vVf0vWp.vFexwG57Lp2D24lV4kG003d154.f52q', 'admin'),
('John Employee', 'john@hrms.com', '$2a$10$vK61u6LGsF3965vVf0vWp.vFexwG57Lp2D24lV4kG003d154.f52q', 'employee')
ON CONFLICT (email) DO NOTHING;

-- 2. Insert Employees profiles
-- John's user_id is likely 2. We do a lookup to be safe or use subqueries.
INSERT INTO employees (user_id, phone, address, department, designation, joining_date, salary) VALUES
((SELECT id FROM users WHERE email = 'john@hrms.com'), '555-0199', '123 Enterprise Way, Suite 400', 'Engineering', 'Software Engineer', '2025-01-15', 75000.00),
((SELECT id FROM users WHERE email = 'admin@hrms.com'), '555-0100', 'HR Headquarters, Building A', 'Human Resources', 'HR Director', '2024-06-01', 95000.00)
ON CONFLICT (user_id) DO NOTHING;

-- 3. Insert Attendance Mock Records (For John)
INSERT INTO attendance (employee_id, date, check_in, check_out, status) VALUES
((SELECT id FROM employees WHERE user_id = (SELECT id FROM users WHERE email = 'john@hrms.com')), '2026-07-01', '2026-07-01 09:02:00+00', '2026-07-01 17:05:00+00', 'present'),
((SELECT id FROM employees WHERE user_id = (SELECT id FROM users WHERE email = 'john@hrms.com')), '2026-07-02', '2026-07-02 08:55:00+00', '2026-07-02 17:00:00+00', 'present'),
((SELECT id FROM employees WHERE user_id = (SELECT id FROM users WHERE email = 'john@hrms.com')), '2026-07-03', '2026-07-03 09:45:00+00', '2026-07-03 17:00:00+00', 'late')
ON CONFLICT DO NOTHING;

-- 4. Insert Leave Requests
INSERT INTO leave (employee_id, leave_type, start_date, end_date, remarks, status, admin_comment) VALUES
((SELECT id FROM employees WHERE user_id = (SELECT id FROM users WHERE email = 'john@hrms.com')), 'casual', '2026-07-10', '2026-07-12', 'Family event attendance', 'pending', NULL)
ON CONFLICT DO NOTHING;

-- 5. Insert Payroll Statement
INSERT INTO payroll (employee_id, basic_salary, bonus, deductions, net_salary, month) VALUES
((SELECT id FROM employees WHERE user_id = (SELECT id FROM users WHERE email = 'john@hrms.com')), 6250.00, 200.00, 150.00, 6300.00, '2026-06')
ON CONFLICT DO NOTHING;
