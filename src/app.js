const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const User = require('./models/User');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/public', express.static(path.join(__dirname, 'public')));

const rootDir = path.join(__dirname, 'views');

app.get('/', (req, res) => {
  res.sendFile(path.join(rootDir, 'home.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(rootDir, 'signup.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(rootDir, 'login.html'));
});

app.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // check duplicate email
    const exists = await User.findOne({ email });
    if (exists) {
      return res.send("Email already registered ❌");
    }

    const hash = await bcrypt.hash(password, 10);

    await User.create({
      username,
      email,
      password: hash
    });

    res.send("Signup successful ✅");
  } catch (err) {
    console.log(err);
    res.send("Signup error");
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.send("User not found ❌");
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.send("Wrong password ❌");
    }

    res.send("Login success 🎉");

  } catch (err) {
    console.log(err);
    res.send("Login error");
  }
});


module.exports = app;
