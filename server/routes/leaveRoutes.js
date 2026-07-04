import { Router } from 'express';
import { leaveController } from '../controllers/leaveController.js';

const router = Router();

router.post('/apply', leaveController.applyLeave);
router.get('/history', leaveController.getHistory);

export default router;
// target: Developer B
