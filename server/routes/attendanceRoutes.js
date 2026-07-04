import { Router } from 'express';
import { attendanceController } from '../controllers/attendanceController.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = Router();

// ----- Employee Endpoints -----
router.post('/check-in', attendanceController.checkIn);
router.post('/check-out', attendanceController.checkOut);
router.get('/history', attendanceController.getHistory); // fallback for dashboard
router.get('/me/today', attendanceController.getMyToday);
router.get('/me', attendanceController.getMyAttendance);
router.get('/me/summary', attendanceController.getMyMonthlySummary);

// ----- Admin / HR Endpoints -----
router.get('/admin/date/:date', authorizeRoles('admin', 'hr'), attendanceController.getAllByDate);
router.get('/admin/range', authorizeRoles('admin', 'hr'), attendanceController.getAllByRange);
router.put('/admin/:employeeId/:date', authorizeRoles('admin', 'hr'), attendanceController.updateAttendance);

export default router;
