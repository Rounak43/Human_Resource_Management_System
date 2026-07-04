import { Router } from 'express';
import authRoutes from './authRoutes.js';
import employeeRoutes from './employeeRoutes.js';
import attendanceRoutes from './attendanceRoutes.js';
import leaveRoutes from './leaveRoutes.js';
import payrollRoutes from './payrollRoutes.js';
import adminRoutes from './adminRoutes.js';

import { verifyToken } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = Router();

// 1. Auth routes (Public)
router.use('/auth', authRoutes);

// 2. Employee routes (Protected)
router.use('/employee', verifyToken, employeeRoutes);
router.use('/attendance', verifyToken, attendanceRoutes);
router.use('/leave', verifyToken, leaveRoutes);
router.use('/payroll', verifyToken, payrollRoutes);

// 3. Admin routes (Protected & Role Restricted)
router.use('/admin', verifyToken, authorizeRoles('admin', 'hr'), adminRoutes);

export default router;
