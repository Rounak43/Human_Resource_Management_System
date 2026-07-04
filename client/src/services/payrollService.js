import api from './api';

export const payrollService = {
  getSalaryStatements: async () => {
    return api.get('/payroll/statements');
  }
};
