/**
 * Generates a random secure temporary password of length 12-16 characters.
 * Guarantees inclusion of uppercase, lowercase, numbers, and special characters.
 */
export const generateTemporaryPassword = () => {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+~|}{[]:;?><,./-=';

  // Ensure we get at least one of each class
  let passwordArray = [
    lowercase[Math.floor(Math.random() * lowercase.length)],
    uppercase[Math.floor(Math.random() * uppercase.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    special[Math.floor(Math.random() * special.length)]
  ];

  // Determine random length between 12 and 16
  const targetLength = Math.floor(Math.random() * 5) + 12; // 12, 13, 14, 15, or 16
  const allChars = lowercase + uppercase + numbers + special;

  for (let i = passwordArray.length; i < targetLength; i++) {
    const randomChar = allChars[Math.floor(Math.random() * allChars.length)];
    passwordArray.push(randomChar);
  }

  // Shuffle the password array using Fisher-Yates shuffle
  for (let i = passwordArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
  }

  return passwordArray.join('');
};
export default generateTemporaryPassword;
