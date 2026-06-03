const Product = require('../models/Product');
const StockStatus = require('../models/StockStatus');

exports.getAll = async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query = {
        $or: [
          { productName: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } },
        ],
      };
    }
    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { productName, category, quantity, unitPrice } = req.body;

    const existing = await Product.findOne({ productName });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Product name already exists' });
    }

    const product = await Product.create({
      productName,
      category,
      quantity: Number(quantity),
      unitPrice: Number(unitPrice),
      createdBy: req.user._id,
    });

    // Auto-create stock status entry
    await StockStatus.create({
      product: product._id,
      availableQuantity: product.quantity,
      soldQuantity: 0,
      remainingQuantity: product.quantity,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, message: 'Product created successfully', data: product });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { productName, category, quantity, unitPrice } = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        productName,
        category,
        quantity: Number(quantity),
        unitPrice: Number(unitPrice),
      },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Update stock status available quantity
    await StockStatus.findOneAndUpdate(
      { product: product._id },
      { availableQuantity: product.quantity },
      { new: true }
    );

    res.json({ success: true, message: 'Product updated successfully', data: product });
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await StockStatus.findOneAndDelete({ product: product._id });

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};
