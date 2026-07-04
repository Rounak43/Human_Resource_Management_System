/**
 * HRMS Client Side System Constants
 */

export const LEAVE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  HALF_DAY: 'half_day',
};

export const LEAVE_TYPES = [
  { value: 'casual', label: 'Casual Leave' },
  { value: 'sick', label: 'Sick Leave' },
  { value: 'maternity', label: 'Maternity Leave' },
  { value: 'unpaid', label: 'Unpaid Leave' },
  { value: 'annual', label: 'Annual Leave' },
];

export const DEPARTMENTS = [
  'Engineering',
  'Human Resources',
  'Finance',
  'Marketing',
  'Sales',
  'Operations',
];
