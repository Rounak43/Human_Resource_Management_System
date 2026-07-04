import { Router } from 'express';
import { payrollController } from '../controllers/payrollController.js';

const router = Router();

router.get('/statements', payrollController.getSalaryStatements);

export default router;
// target: Developer B
