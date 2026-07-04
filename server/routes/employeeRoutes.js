import { Router } from 'express';
import { employeeController } from '../controllers/employeeController.js';

const router = Router();

router.get('/profile', employeeController.getProfile);
router.patch('/profile', employeeController.updateProfile);

export default router;
// target: Developer B
