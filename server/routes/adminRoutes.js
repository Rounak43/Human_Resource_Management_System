import { Router } from 'express';
import { adminController } from '../controllers/adminController.js';

const router = Router();

// Employee Management Directory
router.get('/employees', adminController.getAllEmployees);

// Leave Reviews & Audits
router.patch('/leaves/:id/approve', adminController.approveLeave);
router.patch('/leaves/:id/reject', adminController.rejectLeave);

// Payroll Processing release
router.post('/payroll/:employeeId', adminController.processPayroll);

// Operations analytical reports
router.get('/reports', adminController.getReports);

export default router;
// target: Developer C
