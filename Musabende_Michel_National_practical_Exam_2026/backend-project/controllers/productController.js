const Product = require('../models/Product');

const generateProductCode = async () => {
  const lastProduct = await Product.findOne().sort({ createdAt: -1 });
  const lastNum = lastProduct
    ? parseInt(lastProduct.productCode.replace('PROD', ''), 10)
    : 0;
  return `PROD${String(lastNum + 1).padStart(5, '0')}`;
};

exports.getAll = async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { productCode: { $regex: search, $options: 'i' } },
      ];
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
    const productCode = await generateProductCode();
    const product = await Product.create({
      ...req.body,
      productCode,
      createdBy: req.session.userId,
    });
    res.status(201).json({ success: true, message: 'Product created', data: product });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, message: 'Product updated', data: product });
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
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
};
