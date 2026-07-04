import Employee from '../models/Employee.js';
import { NotFoundError } from '../utils/errors.js';

export const employeeService = {
  getProfile: async (userId) => {
    const profile = await Employee.findByUserId(userId);
    if (!profile) {
      throw new NotFoundError('Employee profile not found');
    }
    return profile;
  },

  updateProfile: async (userId, profileData) => {
    const profile = await Employee.findByUserId(userId);
    if (!profile) {
      throw new NotFoundError('Employee profile not found');
    }

    return Employee.updateProfile(profile.employee_id, profileData);
  }
};
