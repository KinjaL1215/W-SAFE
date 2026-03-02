require('dotenv').config();

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

mongoose.connect('mongodb://127.0.0.1:27017/wsafe')
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// Page Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'home.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'signup.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

// API Routes
app.use('/', authRoutes);

module.exports = app;