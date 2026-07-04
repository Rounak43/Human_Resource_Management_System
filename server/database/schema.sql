-- PostgreSQL HRMS Database Schema Setup
-- Clean start for production schema matching
DROP TABLE IF EXISTS notifications, payroll, leave_requests, leave, attendance, employees, users, departments, roles CASCADE;

-- 1. Roles Table
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL
);

-- 2. Departments Table
CREATE TABLE departments (
    department_id SERIAL PRIMARY KEY,
    department_name VARCHAR(100) UNIQUE NOT NULL,
    manager_id INTEGER
);

-- 3. Employees Table
CREATE TABLE employees (
    employee_id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(30),
    address TEXT,
    department_id INTEGER REFERENCES departments(department_id) ON DELETE SET NULL,
    designation VARCHAR(100),
    joining_date DATE NOT NULL DEFAULT CURRENT_DATE,
    salary NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    profile_image VARCHAR(255)
);

-- 4. Users Table (Core Auth Credentials)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(employee_id) ON DELETE SET NULL,
    email VARCHAR(180) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INTEGER REFERENCES roles(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add Circular Constraints
ALTER TABLE employees ADD CONSTRAINT fk_employee_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE departments ADD CONSTRAINT fk_department_manager FOREIGN KEY (manager_id) REFERENCES employees(employee_id) ON DELETE SET NULL;

-- 5. Attendance Table
CREATE TABLE attendance (
    attendance_id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
    check_in_time TIMESTAMP WITH TIME ZONE,
    check_out_time TIMESTAMP WITH TIME ZONE,
    working_hours NUMERIC(5, 2) DEFAULT 0.00,
    overtime_hours NUMERIC(5, 2) DEFAULT 0.00,
    attendance_status VARCHAR(30) NOT NULL CHECK (attendance_status IN ('Present', 'Absent', 'Leave', 'Half Day', 'Holiday', 'Weekend')),
    late_minutes INTEGER DEFAULT 0,
    early_leave_minutes INTEGER DEFAULT 0,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_employee_date UNIQUE (employee_id, attendance_date)
);

-- 6. Leave Requests Table
CREATE TABLE leave_requests (
    leave_id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
    leave_type VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    number_of_days INTEGER NOT NULL,
    reason TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    approved_by INTEGER REFERENCES employees(employee_id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    remarks TEXT,
    CONSTRAINT check_dates CHECK (end_date >= start_date)
);

-- 7. Payroll Table
CREATE TABLE payroll (
    payroll_id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
    month VARCHAR(20) NOT NULL,
    year INTEGER NOT NULL,
    basic_salary NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    bonus NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    deductions NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    net_salary NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    generated_by INTEGER REFERENCES employees(employee_id) ON DELETE SET NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_employee_month_year UNIQUE (employee_id, month, year)
);

-- 8. Notifications Table
CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(employee_id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_employees_user_id ON employees(user_id);
CREATE INDEX idx_attendance_employee_date ON attendance(employee_id, attendance_date);
CREATE INDEX idx_leave_employee_status ON leave_requests(employee_id, status);
CREATE INDEX idx_payroll_employee_period ON payroll(employee_id, month, year);
CREATE INDEX idx_notifications_employee_read ON notifications(employee_id, is_read);
