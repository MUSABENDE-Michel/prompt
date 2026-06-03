const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const saleController = require('../controllers/saleController');

router.use(auth);

router.get('/', saleController.getAll);

router.get('/:id', saleController.getById);

router.post(
  '/',
  [
    body('product').notEmpty().withMessage('Product is required'),
    body('soldQuantity').isNumeric().withMessage('Sold quantity must be a number'),
    body('soldUnitPrice').isNumeric().withMessage('Sold unit price must be a number'),
  ],
  validate,
  saleController.create
);

router.put(
  '/:id',
  [
    body('soldQuantity').isNumeric().withMessage('Sold quantity must be a number'),
    body('soldUnitPrice').isNumeric().withMessage('Sold unit price must be a number'),
  ],
  validate,
  saleController.update
);

router.delete('/:id', saleController.remove);

module.exports = router;
