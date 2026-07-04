import { Router } from 'express';
import { adminController } from '../controllers/adminController.js';

const router = Router();

// Employee Management Directory CRUD
router.get('/employees', adminController.getAllEmployees);
router.post('/employees', adminController.addEmployee);
router.put('/employees/:id', adminController.editEmployee);
router.delete('/employees/:id', adminController.deleteEmployee);

// Attendance Supervision
router.get('/attendance', adminController.getAllAttendance);
router.put('/attendance/:id', adminController.editAttendance);

// Leave Reviews & Audits
router.get('/leaves', adminController.getLeaveRequests);
router.patch('/leaves/:id/approve', adminController.approveLeave);
router.patch('/leaves/:id/reject', adminController.rejectLeave);

// Payroll Processing & Config
router.get('/payroll', adminController.getPayrollRecords);
router.post('/payroll/:employeeId', adminController.processPayroll);
router.put('/payroll/salary/:employeeId', adminController.updateSalaryConfig);

// Operations analytical reports
router.get('/reports', adminController.getReports);

export default router;
