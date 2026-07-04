import bcryptjs from 'bcryptjs';

/**
 * Server Utility Helper utilities
 */

export const hashPassword = async (password) => {
  const salt = await bcryptjs.genSalt(10);
  return bcryptjs.hash(password, salt);
};

export const comparePassword = async (password, hashedPassword) => {
  return bcryptjs.compare(password, hashedPassword);
};

export const calculateDateDifference = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive
  return diffDays;
};
