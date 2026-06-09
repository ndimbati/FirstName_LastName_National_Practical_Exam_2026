const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  db.query('SELECT * FROM Product', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

router.post('/', (req, res) => {
  const { productName, quantitySold, unitPrice } = req.body;
  db.query('INSERT INTO Product (productName, quantitySold, unitPrice) VALUES (?, ?, ?)',
    [productName, quantitySold, unitPrice], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Product added', productCode: result.insertId });
    });
});

module.exports = router;
