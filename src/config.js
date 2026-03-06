/**
 * Configuration utilities for the W-SAFE application
 */

module.exports = {
  // Server
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Database
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/wsafe',

  // Email
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,

  // JWT (for future authentication)
  JWT_SECRET: process.env.JWT_SECRET,

  // App
  APP_NAME: process.env.APP_NAME || 'W-SAFE',
  APP_DESCRIPTION: process.env.APP_DESCRIPTION || 'Women Safety Application',

  // Validation
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
  OTP_EXPIRY_MINUTES: 5,
  OTP_LENGTH: 6,

  // Security
  BCRYPT_ROUNDS: 10,

  // Feature flags
  FEATURES: {
    EMAIL_VERIFICATION: true,
    SOS_ALERTS: true,
    LOCATION_SHARING: true,
    EMERGENCY_CONTACTS: true
  }
};
