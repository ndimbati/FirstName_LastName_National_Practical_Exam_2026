const express = require('express');
const router = express.Router();
const db = require('../db');

const BASE_QUERY = `
  SELECT s.invoiceNumber, s.salesDate, s.paymentMethod, s.totalAmountPaid,
         c.firstName, c.lastName, c.telephone, c.address,
         p.productName, p.quantitySold, p.unitPrice
  FROM Sale s
  JOIN Customer c ON s.customerNumber = c.customerNumber
  JOIN Product p ON s.productCode = p.productCode
`;

router.get('/daily', (req, res) => {
  db.query(BASE_QUERY + ' WHERE DATE(s.salesDate) = CURDATE() ORDER BY s.invoiceNumber DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

router.get('/weekly', (req, res) => {
  db.query(BASE_QUERY + ' WHERE YEARWEEK(s.salesDate, 1) = YEARWEEK(CURDATE(), 1) ORDER BY s.invoiceNumber DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

router.get('/monthly', (req, res) => {
  db.query(BASE_QUERY + ' WHERE MONTH(s.salesDate) = MONTH(CURDATE()) AND YEAR(s.salesDate) = YEAR(CURDATE()) ORDER BY s.invoiceNumber DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

module.exports = router;
