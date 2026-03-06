/**
 * Global error handling middleware
 */

const { sendError } = require('../utils/apiResponse');

/**
 * Error handling middleware
 * Should be used as the last middleware in the app
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  sendError(res, statusCode, message, err);
};

module.exports = errorHandler;
