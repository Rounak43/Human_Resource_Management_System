-- Mock Seed Data for HRMS Testing

-- 1. Insert Roles
INSERT INTO roles (id, role_name) VALUES 
(1, 'Admin'),
(2, 'Employee')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Departments
INSERT INTO departments (department_id, department_name, manager_id) VALUES
(1, 'Engineering', NULL),
(2, 'Human Resources', NULL),
(3, 'Sales', NULL)
ON CONFLICT (department_id) DO NOTHING;

-- 3. Insert Employees
INSERT INTO employees (employee_id, user_id, full_name, phone, address, department_id, designation, joining_date, salary, profile_image) VALUES
(1, NULL, 'HR Administrator', '555-0100', 'HR Headquarters, Building A', 2, 'HR Director', '2024-06-01', 95000.00, NULL),
(2, NULL, 'John Employee', '555-0199', '123 Enterprise Way, Suite 400', 1, 'Software Engineer', '2025-01-15', 75000.00, NULL)
ON CONFLICT (employee_id) DO NOTHING;

-- 4. Insert Users (Password: 'password123')
INSERT INTO users (id, employee_id, email, password_hash, role_id, is_active) VALUES
(1, 1, 'admin@hrms.com', '$2a$10$vK61u6LGsF3965vVf0vWp.vFexwG57Lp2D24lV4kG003d154.f52q', 1, TRUE),
(2, 2, 'john@hrms.com', '$2a$10$vK61u6LGsF3965vVf0vWp.vFexwG57Lp2D24lV4kG003d154.f52q', 2, TRUE)
ON CONFLICT (id) DO NOTHING;

-- 5. Link employees to user IDs and set department managers
UPDATE employees SET user_id = 1 WHERE employee_id = 1;
UPDATE employees SET user_id = 2 WHERE employee_id = 2;
UPDATE departments SET manager_id = 1 WHERE department_id IN (1, 2);

-- Reset Serial values for IDs
SELECT setval('roles_id_seq', COALESCE((SELECT MAX(id) FROM roles), 1));
SELECT setval('departments_department_id_seq', COALESCE((SELECT MAX(department_id) FROM departments), 1));
SELECT setval('employees_employee_id_seq', COALESCE((SELECT MAX(employee_id) FROM employees), 1));
SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 1));

-- 6. Insert Attendance logs (For Employee 2 - John)
INSERT INTO attendance (employee_id, attendance_date, check_in_time, check_out_time, working_hours, overtime_hours, attendance_status, late_minutes, early_leave_minutes, remarks) VALUES
(2, CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE - INTERVAL '3 days' + TIME '09:00:00', CURRENT_DATE - INTERVAL '3 days' + TIME '17:00:00', 8.00, 0.00, 'Present', 0, 0, 'On-time check-in'),
(2, CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE - INTERVAL '2 days' + TIME '09:15:00', CURRENT_DATE - INTERVAL '2 days' + TIME '17:00:00', 7.75, 0.00, 'Present', 15, 0, 'Slightly late'),
(2, CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE - INTERVAL '1 day' + TIME '08:50:00', CURRENT_DATE - INTERVAL '1 day' + TIME '18:30:00', 9.50, 1.50, 'Present', 0, 0, 'Extra hours for release support')
ON CONFLICT DO NOTHING;

-- 7. Insert Leave Requests (For Employee 2 - John)
INSERT INTO leave_requests (leave_id, employee_id, leave_type, start_date, end_date, number_of_days, reason, status, approved_by, approved_at, remarks) VALUES
(1, 2, 'Sick Leave', CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE - INTERVAL '9 days', 2, 'Flu symptoms and medical rest', 'Approved', 1, CURRENT_TIMESTAMP - INTERVAL '10 days', 'Take rest, approved'),
(2, 2, 'Casual Leave', CURRENT_DATE + INTERVAL '5 days', CURRENT_DATE + INTERVAL '7 days', 3, 'Family wedding attendance', 'Pending', NULL, NULL, NULL)
ON CONFLICT (leave_id) DO NOTHING;

-- 8. Insert Payroll (For Employee 2 - John)
INSERT INTO payroll (payroll_id, employee_id, month, year, basic_salary, bonus, deductions, net_salary, generated_by) VALUES
(1, 2, 'June', 2026, 6250.00, 500.00, 250.00, 6500.00, 1)
ON CONFLICT (payroll_id) DO NOTHING;

-- 9. Insert Notifications
INSERT INTO notifications (notification_id, employee_id, title, message, type, is_read) VALUES
(1, 2, 'Welcome to HRMS', 'Your employee profile is successfully set up in the enterprise directory.', 'Announcement', FALSE),
(2, 2, 'Payroll Generated', 'Your payroll statement for June 2026 is generated. Check details in the payroll center.', 'Payroll', FALSE),
(3, 2, 'Leave Request Approved', 'Your sick leave request from 10 days ago is approved by Admin.', 'Leave', TRUE)
ON CONFLICT (notification_id) DO NOTHING;

SELECT setval('leave_requests_leave_id_seq', COALESCE((SELECT MAX(leave_id) FROM leave_requests), 1));
SELECT setval('payroll_payroll_id_seq', COALESCE((SELECT MAX(payroll_id) FROM payroll), 1));
SELECT setval('notifications_notification_id_seq', COALESCE((SELECT MAX(notification_id) FROM notifications), 1));
