/**
 * Standardized API response wrapper
 */

/**
 * Send success response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {any} data - Response data (optional)
 */
exports.sendSuccess = (res, statusCode = 200, message = 'Success', data = null) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

/**
 * Send error response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {any} error - Error details (optional)
 */
exports.sendError = (res, statusCode = 500, message = 'An error occurred', error = null) => {
  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? error : undefined,
    timestamp: new Date().toISOString()
  });
};

/**
 * Send validation error response
 * @param {object} res - Express response object
 * @param {string} message - Validation error message
 * @param {array} errors - Array of validation errors
 */
exports.sendValidationError = (res, message = 'Validation failed', errors = []) => {
  res.status(400).json({
    success: false,
    message,
    errors,
    timestamp: new Date().toISOString()
  });
};
