/**
 * Authentication Routes
 * 
 * This module contains all authentication-related API endpoints
 * - OTP generation and verification
 * - User registration (signup)
 * - User authentication (login)
 * - Password management
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * @route   POST /api/send-otp
 * @desc    Send OTP to user's email for verification
 * @access  Public
 * @body    { email: string }
 * @returns { success: boolean, message: string }
 */
router.post('/send-otp', authController.sendOtp);

/**
 * @route   POST /api/signup
 * @desc    Register a new user with email verification
 * @access  Public
 * @body    {
 *            username: string,
 *            email: string,
 *            password: string,
 *            confirmPassword: string,
 *            otp: string
 *          }
 * @returns { success: boolean, message: string, data: object }
 */
router.post('/signup', authController.signup);

/**
 * @route   POST /api/login
 * @desc    Authenticate user and log them in
 * @access  Public
 * @body    { email: string, password: string }
 * @returns { success: boolean, message: string, data: object }
 */
router.post('/login', authController.login);

/**
 * @route   POST /api/change-password
 * @desc    Change user's password
 * @access  Private (authenticated)
 * @body    {
 *            email: string,
 *            oldPassword: string,
 *            newPassword: string
 *          }
 * @returns { success: boolean, message: string }
 */
router.post('/change-password', authController.changePassword);

/**
 * @route   GET /api/profile
 * @desc    Get user profile by email
 * @access  Private (email-based for now)
 * @query   { email: string }
 */
router.get('/profile', authController.getProfile);

/**
 * @route   PUT /api/profile
 * @desc    Update user profile fields (username, image)
 * @access  Private (email-based for now)
 * @body    { email: string, username?: string, image?: string }
 */
router.put('/profile', authController.updateProfile);

/**
 * @route   GET /api/logout
 * @desc    Logout user and clear session
 * @access  Private (authenticated)
 * @returns { HTML redirect to login page }
 */
router.get('/logout', authController.logout);

module.exports = router;
