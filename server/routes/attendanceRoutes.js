import { Router } from 'express';
import { attendanceController } from '../controllers/attendanceController.js';

const router = Router();

router.post('/check-in', attendanceController.checkIn);
router.post('/check-out', attendanceController.checkOut);
router.get('/history', attendanceController.getHistory);

export default router;
// target: Developer B
