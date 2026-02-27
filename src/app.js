const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('./models/User');

const app = express();

// ================= MIDDLEWARE =================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/public', express.static(path.join(__dirname, 'public')));

const rootDir = path.join(__dirname, 'views');

// ================= ROUTES =================

// Home
app.get('/', (req, res) => {
  res.sendFile(path.join(rootDir, 'home.html'));
});

// Signup page
app.get('/signup', (req, res) => {
  res.sendFile(path.join(rootDir, 'signup.html'));
});

// Login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(rootDir, 'login.html'));
});

// Dashboard
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(rootDir, 'dashboard.html'));
});

// ================= SIGNUP =================
app.post('/signup', async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.json({ message: "Passwords do not match ❌" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.json({ message: "Email already registered ❌" });
    }

    const hash = await bcrypt.hash(password, 10);

    await User.create({
      username,
      email,
      password: hash
    });

    res.json({ message: "Signup successful ✅" });

  } catch (err) {
    console.log(err);
    res.json({ message: "Signup error ❌" });
  }
});

// ================= LOGIN =================
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ message: "User not found ❌" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.json({ message: "Wrong password ❌" });
    }

    res.json({
      message: "Login successful ✅",
      email: user.email,
      username: user.username,
      image: user.image || ""
    });

  } catch (err) {
    console.log(err);
    res.json({ message: "Login error ❌" });
  }
});

// ================= UPDATE PROFILE =================
app.post('/update-profile', async (req, res) => {
  try {
    const { email, username, image } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found ❌" });
    }

    if (username) user.username = username;
    if (image) user.image = image;

    await user.save();

    res.json({ message: "Profile updated successfully ✅" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error ❌" });
  }
});

// ================= CHANGE PASSWORD =================
app.post('/change-password', async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found ❌" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Old password incorrect ❌" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;

    await user.save();

    res.json({ message: "Password updated successfully ✅" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error ❌" });
  }
});

// ================= LOGOUT =================
app.get('/logout', (req, res) => {
  res.redirect('/login');
});

module.exports = app;