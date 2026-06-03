const StockStatus = require('../models/StockStatus');

exports.getAll = async (req, res, next) => {
  try {
    const { search, startDate, endDate } = req.query;
    let query = {};
    if (search) {
      const products = await require('../models/Product').find({
        productName: { $regex: search, $options: 'i' },
      }).select('_id');
      query.product = { $in: products.map((p) => p._id) };
    }
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate + 'T23:59:59.999Z'),
      };
    }
    const statuses = await StockStatus.find(query)
      .populate('product', 'productName category')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: statuses });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const status = await StockStatus.findById(req.params.id)
      .populate('product', 'productName category');
    if (!status) {
      return res.status(404).json({ success: false, message: 'Stock status not found' });
    }
    res.json({ success: true, data: status });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { product, availableQuantity, soldQuantity } = req.body;

    const existing = await StockStatus.findOne({ product });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Stock status already exists for this product',
      });
    }

    const status = await StockStatus.create({
      product,
      availableQuantity: Number(availableQuantity),
      soldQuantity: Number(soldQuantity || 0),
      createdBy: req.user._id,
    });

    const populated = await StockStatus.findById(status._id)
      .populate('product', 'productName category');
    res.status(201).json({ success: true, message: 'Stock status created', data: populated });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { availableQuantity, soldQuantity } = req.body;
    const status = await StockStatus.findByIdAndUpdate(
      req.params.id,
      { availableQuantity: Number(availableQuantity), soldQuantity: Number(soldQuantity || 0) },
      { new: true, runValidators: true }
    ).populate('product', 'productName category');

    if (!status) {
      return res.status(404).json({ success: false, message: 'Stock status not found' });
    }
    res.json({ success: true, message: 'Stock status updated', data: status });
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const status = await StockStatus.findByIdAndDelete(req.params.id);
    if (!status) {
      return res.status(404).json({ success: false, message: 'Stock status not found' });
    }
    res.json({ success: true, message: 'Stock status deleted' });
  } catch (error) {
    next(error);
  }
};
