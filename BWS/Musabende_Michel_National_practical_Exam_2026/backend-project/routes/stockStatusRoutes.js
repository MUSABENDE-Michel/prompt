const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const stockStatusController = require('../controllers/stockStatusController');

router.use(auth);

router.get('/', stockStatusController.getAll);

router.get('/:id', stockStatusController.getById);

router.post(
  '/',
  [
    body('product').notEmpty().withMessage('Product is required'),
    body('availableQuantity').isNumeric().withMessage('Available quantity must be a number'),
  ],
  validate,
  stockStatusController.create
);

router.put(
  '/:id',
  [
    body('availableQuantity').isNumeric().withMessage('Available quantity must be a number'),
  ],
  validate,
  stockStatusController.update
);

router.delete('/:id', stockStatusController.remove);

module.exports = router;
