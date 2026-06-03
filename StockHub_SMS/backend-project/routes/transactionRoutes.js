const express = require('express');
const transactionController = require('../controllers/transactionController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, transactionController.getAll);
router.get('/:id', auth, transactionController.getById);
router.post('/', auth, transactionController.create);
router.put('/:id', auth, transactionController.update);
router.delete('/:id', auth, transactionController.remove);

module.exports = router;
