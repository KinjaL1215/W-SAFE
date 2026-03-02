const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const User = require('../models/User');

let otpStore = {};

// Nodemailer Setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// ===== SEND OTP =====
exports.sendOtp = async (req, res) => {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStore[email] = otp;

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your OTP - W-SAFE",
            text: `Your OTP is ${otp}`
        });

        res.json({ success: true, message: "OTP Sent Successfully" });
    } catch (err) {
        console.log(err);
        res.json({ success: false, message: "Error Sending OTP" });
    }
};

// ===== SIGNUP =====
exports.signup = async (req, res) => {
    const { username, email, password, confirmPassword, otp } = req.body;

    if (otpStore[email] != otp) {
        return res.json({ success: false, message: "Invalid OTP ❌" });
    }

    if (password !== confirmPassword) {
        return res.json({ success: false, message: "Passwords do not match ❌" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
        return res.json({ success: false, message: "Email already exists ❌" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
        username,
        email,
        password: hashedPassword
    });

    delete otpStore[email];

    return res.json({ success: true, message: "Signup successful", username, email });
};

// ===== LOGIN =====
exports.login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        return res.json({ success: false, message: "User not found ❌" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.json({ success: false, message: "Wrong Password ❌" });
    }

    return res.json({ success: true, message: "Login successful", username: user.username, email: user.email });
};