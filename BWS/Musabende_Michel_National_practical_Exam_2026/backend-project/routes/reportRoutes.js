const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const reportController = require('../controllers/reportController');

router.use(auth);

router.get('/daily-sales', reportController.dailySalesReport);

router.get('/daily-stock', reportController.dailyStockStatusReport);

router.get('/export', reportController.exportReport);

module.exports = router;
