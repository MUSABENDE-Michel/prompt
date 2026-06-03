const express = require('express');
const reportController = require('../controllers/reportController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/dashboard', auth, reportController.getDashboard);
router.get('/stock-report', auth, reportController.getStockReport);
router.get('/stock-in-report', auth, reportController.getStockInReport);
router.get('/stock-out-report', auth, reportController.getStockOutReport);
router.get('/daily-report', auth, reportController.getDailyReport);
router.get('/weekly-report', auth, reportController.getWeeklyReport);
router.get('/monthly-report', auth, reportController.getMonthlyReport);

module.exports = router;
