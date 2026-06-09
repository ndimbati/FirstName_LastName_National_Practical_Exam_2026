const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  db.query('INSERT INTO Users (username, password) VALUES (?, ?)', [username, hash], (err) => {
    if (err) return res.status(400).json({ error: 'Username already exists' });
    res.json({ message: 'User created successfully' });
  });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.query('SELECT * FROM Users WHERE username = ?', [username], async (err, results) => {
    if (err || results.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, results[0].password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: results[0].id, username }, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, username });
  });
});

module.exports = router;
