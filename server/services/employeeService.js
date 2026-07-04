import Employee from '../models/Employee.js';
import User from '../models/User.js';
import { hashPassword } from '../utils/helpers.js';
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

    // If new password is provided, update it
    if (profileData.newPassword) {
      const hashedPassword = await hashPassword(profileData.newPassword);
      await User.updatePassword(userId, hashedPassword);
    }

    return Employee.update(profile.employee_id, {
      full_name: profileData.full_name,
      phone: profileData.phone,
      address: profileData.address,
      profile_image: profileData.profile_image
    });
  }
};
