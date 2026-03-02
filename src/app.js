require('dotenv').config();

const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

// Import User Model
const User = require('./models/User');

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

mongoose.connect('mongodb://127.0.0.1:27017/wsafe')

.then(() => console.log("MongoDB Connected"))

.catch(err => console.log(err));



// ===== OTP Store =====

let otpStore = {};



// ===== Nodemailer Setup =====

const transporter = nodemailer.createTransport({

    service: 'gmail',

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }

});



// ===== Pages Routes =====


// Home Page
app.get('/', (req, res) => {

    res.sendFile(path.join(__dirname, 'views', 'home.html'));

});



// Signup Page
app.get('/signup', (req, res) => {

    res.sendFile(path.join(__dirname, 'views', 'signup.html'));

});



// Login Page
app.get('/login', (req, res) => {

    res.sendFile(path.join(__dirname, 'views', 'login.html'));

});



// Dashboard Page
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

        res.json({
            success: true,
            message: "OTP Sent Successfully"
        });

    }

    catch (err) {

        console.log(err);

        res.json({
            success: false,
            message: "Error Sending OTP"
        });

    }

});



// ===== SIGNUP =====

app.post('/signup', async (req, res) => {

    const { username, email, password, confirmPassword, otp } = req.body;


    // OTP Check
    if (otpStore[email] != otp) {
        return res.json({ success: false, message: "Invalid OTP ❌" });
    }

    // Password Match Check
    if (password !== confirmPassword) {
        return res.json({ success: false, message: "Passwords do not match ❌" });
    }

    // Email Exists Check
    const exists = await User.findOne({ email });
    if (exists) {
        return res.json({ success: false, message: "Email already exists ❌" });
    }

    // Password Hash
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save User
    await User.create({
        username,
        email,
        password: hashedPassword
    });

    delete otpStore[email];

    // respond with success JSON (client will redirect)
    return res.json({ success: true, message: "Signup successful", username, email });

});




// ===== LOGIN =====

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        return res.json({ success: false, message: "User not found ❌" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.json({ success: false, message: "Wrong Password ❌" });
    }

    // login success, send username back
    return res.json({ success: true, message: "Login successful", username: user.username, email: user.email });
});



module.exports = app; 