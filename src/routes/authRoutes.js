const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

const User = require('../models/User');

// In-memory OTP store (simple)
let otpStore = {};

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send OTP
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.json({ success: false, message: 'Email is required' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email] = otp;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP - W-SAFE',
      text: `Your OTP is ${otp}`
    });

    return res.json({ success: true, message: 'OTP Sent Successfully' });
  } catch (err) {
    console.error('OTP send error:', err);
    return res.json({ success: false, message: 'Error sending OTP' });
  }
});

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, confirmPassword, otp } = req.body;

    if (!email || !password) return res.json({ success: false, message: 'Email and password required' });

    if (otpStore[email] !== otp) return res.json({ success: false, message: 'Invalid OTP ❌' });

    if (password !== confirmPassword) return res.json({ success: false, message: 'Passwords do not match ❌' });

    const exists = await User.findOne({ email });
    if (exists) return res.json({ success: false, message: 'Email already exists ❌' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword });

    delete otpStore[email];

    return res.json({ success: true, message: 'Signup successful', username: user.username, email: user.email });
  } catch (err) {
    console.error('Signup error:', err);
    return res.json({ success: false, message: 'Signup failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.json({ success: false, message: 'Email and password required' });

    const user = await User.findOne({ email });
    if (!user) return res.json({ success: false, message: 'User not found ❌' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.json({ success: false, message: 'Wrong Password ❌' });

    return res.json({ success: true, message: 'Login successful', username: user.username, email: user.email });
  } catch (err) {
    console.error('Login error:', err);
    return res.json({ success: false, message: 'Login failed' });
  }
});

// Change password
router.post('/change-password', async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const ok = await bcrypt.compare(oldPassword, user.password);
    if (!ok) return res.status(401).json({ success: false, message: 'Old password incorrect' });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    return res.json({ success: true, message: 'Password changed' });
  } catch (err) {
    console.error('Change password error:', err);
    return res.status(500).json({ success: false, message: 'Could not change password' });
  }
});

module.exports = router;
