const express = require('express');
const billController = require('../controllers/billController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, billController.create);
router.get('/', auth, billController.getAll);
router.get('/:id', auth, billController.getById);
router.put('/:id/status', auth, billController.updateStatus);
router.delete('/:id', auth, billController.remove);

module.exports = router;
