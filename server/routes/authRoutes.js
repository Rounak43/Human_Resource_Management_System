import { Router } from 'express';
import { authController } from '../controllers/authController.js';

const router = Router();

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/forgot-password', authController.forgotPassword);

export default router;
// target: Developer A
