const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const productController = require('../controllers/productController');

router.use(auth);

router.get('/', productController.getAll);

router.get('/:id', productController.getById);

router.post(
  '/',
  [
    body('productName').trim().notEmpty().withMessage('Product name is required'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('quantity').isNumeric().withMessage('Quantity must be a number'),
    body('unitPrice').isNumeric().withMessage('Unit price must be a number'),
  ],
  validate,
  productController.create
);

router.put(
  '/:id',
  [
    body('productName').trim().notEmpty().withMessage('Product name is required'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('quantity').isNumeric().withMessage('Quantity must be a number'),
    body('unitPrice').isNumeric().withMessage('Unit price must be a number'),
  ],
  validate,
  productController.update
);

router.delete('/:id', productController.remove);

module.exports = router;
