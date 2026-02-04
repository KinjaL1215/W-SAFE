const express = require('express');
const path = require('path');

const app = express();
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/public', express.static(path.join(__dirname, 'public')));
const rootDir = path.join(__dirname, 'views');

app.get('/', (req, res) => {
  res.sendFile(path.join(rootDir, 'home.html'));
});

module.exports = app;