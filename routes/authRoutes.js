const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// OTP
router.post('/send-otp', authController.sendOtp);

// Signup
router.post('/signup', authController.signup);

// Login
router.post('/login', authController.login);

module.exports = router;