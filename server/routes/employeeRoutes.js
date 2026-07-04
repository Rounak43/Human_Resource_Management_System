import { Router } from 'express';
import { employeeController } from '../controllers/employeeController.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { validateEmployeeCreate, validateEmployeeUpdate } from '../middleware/validation.js';

const router = Router();

// ----- Standard Employee Profile -----
router.get('/profile', employeeController.getProfile);
router.patch('/profile', validateEmployeeUpdate, employeeController.updateProfile);

// ----- Employee Management CRUD -----
router.post('/', authorizeRoles('admin', 'hr'), validateEmployeeCreate, employeeController.createEmployee);
router.get('/', employeeController.getAllEmployees); // accessible to standard employees (with payload filtering)
router.get('/:employeeId', employeeController.getEmployeeById); // accessible to standard employees (with payload filtering)
router.put('/:employeeId', authorizeRoles('admin', 'hr'), validateEmployeeUpdate, employeeController.updateEmployee);
router.delete('/:employeeId', authorizeRoles('admin', 'hr'), employeeController.deleteEmployee);

export default router;
