const express = require('express');
const router = express.Router();
const db = require('../db');

const SELECT_SALES = `
  SELECT s.*, c.firstName, c.lastName, p.productName
  FROM Sale s
  JOIN Customer c ON s.customerNumber = c.customerNumber
  JOIN Product p ON s.productCode = p.productCode
`;

router.get('/', (req, res) => {
  db.query(SELECT_SALES + ' ORDER BY s.invoiceNumber DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

router.post('/', (req, res) => {
  const { salesDate, paymentMethod, totalAmountPaid, customerNumber, productCode } = req.body;
  db.query('INSERT INTO Sale (salesDate, paymentMethod, totalAmountPaid, customerNumber, productCode) VALUES (?, ?, ?, ?, ?)',
    [salesDate, paymentMethod, totalAmountPaid, customerNumber, productCode], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Sale recorded', invoiceNumber: result.insertId });
    });
});

router.put('/:id', (req, res) => {
  const { salesDate, paymentMethod, totalAmountPaid, customerNumber, productCode } = req.body;
  db.query('UPDATE Sale SET salesDate=?, paymentMethod=?, totalAmountPaid=?, customerNumber=?, productCode=? WHERE invoiceNumber=?',
    [salesDate, paymentMethod, totalAmountPaid, customerNumber, productCode, req.params.id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Sale updated' });
    });
});

router.delete('/:id', (req, res) => {
  db.query('DELETE FROM Sale WHERE invoiceNumber = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Sale deleted' });
  });
});

module.exports = router;
