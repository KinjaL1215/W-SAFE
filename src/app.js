require('dotenv').config();

const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const app = express();

// ===== Middleware =====
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, 'public')));

// ===== MongoDB =====
mongoose.connect('mongodb://127.0.0.1:27017/wsafe')
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// ===== User Schema =====
const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String
});

const User = mongoose.model('User', userSchema);

// ===== OTP Store =====
let otpStore = {};

// ===== Nodemailer =====
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// ===== Routes =====

// Signup page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'signup.html'));
});

// Login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Dashboard page
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

// ===== SEND OTP =====
app.post('/send-otp', async (req, res) => {
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

        res.json({ success: true, message: "OTP sent successfully" });

    } catch (err) {
        console.log(err);
        res.json({ success: false, message: "Error sending OTP" });
    }
});

// ===== SIGNUP =====
app.post('/signup', async (req, res) => {
    const { username, email, password, confirmPassword, otp } = req.body;

    if (otpStore[email] != otp) {
        return res.send("Invalid OTP ❌");
    }

    if (password !== confirmPassword) {
        return res.send("Passwords do not match ❌");
    }

    const exists = await User.findOne({ email });
    if (exists) {
        return res.send("Email already exists ❌");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
        username,
        email,
        password: hashedPassword
    });

    delete otpStore[email];

    // ✅ REDIRECT AFTER SIGNUP
    res.redirect('/dashboard');
});

// ===== LOGIN =====
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        return res.send("User not found ❌");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return res.send("Wrong password ❌");
    }

    // ✅ REDIRECT AFTER LOGIN
    res.redirect('/dashboard');
});

module.exports = app;