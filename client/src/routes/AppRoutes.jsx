import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import AuthLayout from '../layouts/AuthLayout';
import EmployeeLayout from '../layouts/EmployeeLayout';
import AdminLayout from '../layouts/AdminLayout';

// Pages - Auth
import AuthPage from '../pages/auth/AuthPage';
import ForgotPassword from '../pages/auth/ForgotPassword';

// Pages - Employee
import EmployeeDashboard from '../pages/employee/Dashboard';
import EmployeeProfile from '../pages/employee/Profile';
import EmployeeAttendance from '../pages/employee/Attendance';
import EmployeeLeave from '../pages/employee/Leave';
import EmployeePayroll from '../pages/employee/Payroll';
import EmployeeSettings from '../pages/employee/Settings';

// Pages - Admin
import AdminDashboard from '../pages/admin/Dashboard';
import EmployeeManagement from '../pages/admin/EmployeeManagement';
import AttendanceManagement from '../pages/admin/AttendanceManagement';
import LeaveManagement from '../pages/admin/LeaveManagement';
import PayrollManagement from '../pages/admin/PayrollManagement';
import Departments from '../pages/admin/Departments';
import Reports from '../pages/admin/Reports';

// Guards
import ProtectedRoute from './ProtectedRoute';
import RoleGuard from './RoleGuard';

/**
 * AppRoutes Component
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* 1. Public Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>


      {/* 2. Protected Employee Routes */}
      <Route element={<ProtectedRoute><EmployeeLayout /></ProtectedRoute>}>
        <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
        <Route path="/employee/profile" element={<EmployeeProfile />} />
        <Route path="/employee/attendance" element={<EmployeeAttendance />} />
        <Route path="/employee/leave" element={<EmployeeLeave />} />
        <Route path="/employee/payroll" element={<EmployeePayroll />} />
        <Route path="/employee/settings" element={<EmployeeSettings />} />
      </Route>

      {/* 3. Protected Admin Routes */}
      <Route element={<ProtectedRoute><RoleGuard allowedRoles={['admin', 'hr']}><AdminLayout /></RoleGuard></ProtectedRoute>}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/employees" element={<EmployeeManagement />} />
        <Route path="/admin/attendance" element={<AttendanceManagement />} />
        <Route path="/admin/leaves" element={<LeaveManagement />} />
        <Route path="/admin/payroll" element={<PayrollManagement />} />
        <Route path="/admin/departments" element={<Departments />} />
        <Route path="/admin/reports" element={<Reports />} />
      </Route>

      {/* Default Redirection */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
