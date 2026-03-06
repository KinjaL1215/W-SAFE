/**
 * Validation utilities for input data
 */

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password strength regex (min 8 chars, 1 uppercase, 1 number)
const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
exports.isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  return emailRegex.test(email.trim());
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {boolean}
 */
exports.isValidPassword = (password) => {
  if (!password || typeof password !== 'string') return false;
  return passwordRegex.test(password);
};

/**
 * Validate username length and format
 * @param {string} username - Username to validate
 * @returns {boolean}
 */
exports.isValidUsername = (username) => {
  if (!username || typeof username !== 'string') return false;
  // 3-30 chars, alphanumeric and underscore only
  return /^[a-zA-Z0-9_]{3,30}$/.test(username.trim());
};

/**
 * Validate OTP format (6 digits)
 * @param {string} otp - OTP to validate
 * @returns {boolean}
 */
exports.isValidOtp = (otp) => {
  if (!otp || typeof otp !== 'string') return false;
  return /^\d{6}$/.test(otp);
};

/**
 * Sanitize user input to prevent XSS
 * @param {string} input - Input to sanitize
 * @returns {string}
 */
exports.sanitizeInput = (input) => {
  if (!input) return '';
  return input
    .replace(/[<>]/g, '')
    .trim()
    .substring(0, 255);
};

/**
 * Validate request body has required fields
 * @param {object} body - Request body
 * @param {array} requiredFields - Array of required field names
 * @returns {object} - { valid: boolean, missingFields: array }
 */
exports.validateRequiredFields = (body, requiredFields) => {
  const missingFields = requiredFields.filter(field => !body[field]);
  return {
    valid: missingFields.length === 0,
    missingFields
  };
};
