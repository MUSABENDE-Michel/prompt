const express = require('express');
const warehouseController = require('../controllers/warehouseController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, warehouseController.getAll);
router.get('/:id', auth, warehouseController.getById);
router.post('/', auth, warehouseController.create);
router.put('/:id', auth, warehouseController.update);
router.delete('/:id', auth, warehouseController.remove);

module.exports = router;
