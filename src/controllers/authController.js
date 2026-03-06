const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { sendSuccess, sendError, sendValidationError } = require('../utils/apiResponse');
const { isValidEmail, isValidPassword, isValidUsername, isValidOtp, validateRequiredFields } = require('../utils/validation');

// In-memory OTP store with expiry (5 minutes)
let otpStore = {};

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Send OTP to email
 * @route POST /api/send-otp
 * @param {string} email - User email
 */
exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate required fields
    const { valid, missingFields } = validateRequiredFields(req.body, ['email']);
    if (!valid) {
      return sendValidationError(res, 'Missing required fields', missingFields);
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return sendValidationError(res, 'Invalid email format');
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 }; // 5 minutes

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: '🔐 Your W-SAFE Verification Code',
        html: `
          <h2>W-SAFE Verification Code</h2>
          <p>Your verification code is: <strong>${otp}</strong></p>
          <p>This code will expire in 5 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        `
      });

      sendSuccess(res, 200, 'OTP sent successfully to your email');
    } catch (emailErr) {
      console.error('Email send error:', emailErr);
      sendError(res, 500, 'Failed to send OTP. Please try again.');
    }
  } catch (err) {
    console.error('Send OTP error:', err);
    sendError(res, 500, 'Server error during OTP generation');
  }
};

/**
 * User signup
 * @route POST /api/signup
 * @param {string} username - Username
 * @param {string} email - Email
 * @param {string} password - Password
 * @param {string} confirmPassword - Confirm password
 * @param {string} otp - OTP from email
 */
exports.signup = async (req, res) => {
  try {
    const { username, email, password, confirmPassword, otp } = req.body;

    // Validate required fields
    const { valid, missingFields } = validateRequiredFields(req.body, ['username', 'email', 'password', 'confirmPassword', 'otp']);
    if (!valid) {
      return sendValidationError(res, 'Missing required fields', missingFields);
    }

    // Validate inputs
    if (!isValidUsername(username)) {
      return sendValidationError(res, 'Username must be 3-30 characters, alphanumeric only');
    }

    if (!isValidEmail(email)) {
      return sendValidationError(res, 'Invalid email format');
    }

    if (!isValidPassword(password)) {
      return sendValidationError(res, 'Password must be at least 8 characters with uppercase and numbers');
    }

    if (password !== confirmPassword) {
      return sendValidationError(res, 'Passwords do not match');
    }

    if (!isValidOtp(otp)) {
      return sendValidationError(res, 'Invalid OTP format');
    }

    // Check OTP validity
    const otpData = otpStore[email];
    if (!otpData || otpData.otp !== otp || otpData.expiresAt < Date.now()) {
      return sendError(res, 400, 'Invalid or expired OTP');
    }

    // Check if user exists
    const exists = await User.findOne({ email });
    if (exists) {
      return sendError(res, 409, 'Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      username: username.trim(),
      email: email.toLowerCase(),
      password: hashedPassword
    });

    // Clear OTP
    delete otpStore[email];

    sendSuccess(res, 201, 'Signup successful', {
      userId: user._id,
      username: user.username,
      email: user.email
    });
  } catch (err) {
    console.error('Signup error:', err);
    sendError(res, 500, 'Signup failed. Please try again.');
  }
};

/**
 * User login
 * @route POST /api/login
 * @param {string} email - Email
 * @param {string} password - Password
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    const { valid, missingFields } = validateRequiredFields(req.body, ['email', 'password']);
    if (!valid) {
      return sendValidationError(res, 'Missing required fields', missingFields);
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return sendValidationError(res, 'Invalid email format');
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return sendError(res, 401, 'Invalid email or password');
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendError(res, 401, 'Invalid email or password');
    }

    sendSuccess(res, 200, 'Login successful', {
      userId: user._id,
      username: user.username,
      email: user.email
    });
  } catch (err) {
    console.error('Login error:', err);
    sendError(res, 500, 'Login failed. Please try again.');
  }
};

/**
 * Change password
 * @route POST /api/change-password
 * @param {string} email - Email
 * @param {string} oldPassword - Old password
 * @param {string} newPassword - New password
 */
exports.changePassword = async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    // Validate required fields
    const { valid, missingFields } = validateRequiredFields(req.body, ['email', 'oldPassword', 'newPassword']);
    if (!valid) {
      return sendValidationError(res, 'Missing required fields', missingFields);
    }

    // Validate email
    if (!isValidEmail(email)) {
      return sendValidationError(res, 'Invalid email format');
    }

    // Validate new password
    if (!isValidPassword(newPassword)) {
      return sendValidationError(res, 'Password must be at least 8 characters with uppercase and numbers');
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return sendError(res, 401, 'Old password is incorrect');
    }

    // Hash and update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    sendSuccess(res, 200, 'Password changed successfully');
  } catch (err) {
    console.error('Change password error:', err);
    sendError(res, 500, 'Failed to change password');
  }
};

/**
 * Logout
 * @route GET /api/logout
 */
exports.logout = (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Logging out...</title>
      <meta http-equiv="refresh" content="1;url=/login">
    </head>
    <body>
      <script>
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/login';
      </script>
    </body>
    </html>
  `);
};
