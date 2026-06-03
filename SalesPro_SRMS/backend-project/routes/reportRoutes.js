const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getReport,
  exportReport,
} = require('../controllers/reportController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/dashboard', getDashboardStats);
router.get('/data', getReport);
router.get('/export', exportReport);

module.exports = router;
