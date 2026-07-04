import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/forgot-password', authController.forgotPassword);
router.get('/profile', verifyToken, authController.getMe);
router.get('/me', verifyToken, authController.getMe); // fallback
router.post('/logout', authController.logout);

export default router;
