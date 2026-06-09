const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  db.query('SELECT * FROM Customer', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

router.post('/', (req, res) => {
  const { firstName, lastName, telephone, address } = req.body;
  db.query('INSERT INTO Customer (firstName, lastName, telephone, address) VALUES (?, ?, ?, ?)',
    [firstName, lastName, telephone, address], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Customer added', customerNumber: result.insertId });
    });
});

module.exports = router;
