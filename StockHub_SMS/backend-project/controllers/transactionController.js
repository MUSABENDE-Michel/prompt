const StockTransaction = require('../models/StockTransaction');
const Product = require('../models/Product');

exports.getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { transactionType: { $regex: search, $options: 'i' } },
      ];
    }
    const total = await StockTransaction.countDocuments(query);
    const transactions = await StockTransaction.find(query)
      .populate('product', 'productName productCode')
      .populate('warehouse', 'warehouseName warehouseCode')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({
      success: true,
      data: transactions,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const transaction = await StockTransaction.findById(req.params.id)
      .populate('product', 'productName productCode')
      .populate('warehouse', 'warehouseName warehouseCode');
    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found' });
    res.json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { product, warehouse, transactionType, quantityMoved, transactionDate } = req.body;
    const productDoc = await Product.findById(product);
    if (!productDoc) return res.status(404).json({ success: false, message: 'Product not found' });

    if (transactionType === 'STOCK_OUT' && productDoc.quantityInStock < quantityMoved) {
      return res.status(400).json({ success: false, message: 'Insufficient stock quantity' });
    }

    const adjustment = transactionType === 'STOCK_IN' ? quantityMoved : -quantityMoved;
    await Product.findByIdAndUpdate(product, { $inc: { quantityInStock: adjustment } });

    const transaction = await StockTransaction.create({
      transactionDate,
      quantityMoved,
      transactionType,
      product,
      warehouse,
      createdBy: req.user._id,
    });

    const populated = await StockTransaction.findById(transaction._id)
      .populate('product', 'productName productCode')
      .populate('warehouse', 'warehouseName warehouseCode');

    res.status(201).json({ success: true, message: 'Transaction created successfully', data: populated });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const transaction = await StockTransaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found' });

    const oldAdjustment = transaction.transactionType === 'STOCK_IN' ? transaction.quantityMoved : -transaction.quantityMoved;
    await Product.findByIdAndUpdate(transaction.product, { $inc: { quantityInStock: -oldAdjustment } });

    const { product, warehouse, transactionType, quantityMoved, transactionDate } = req.body;
    if (transactionType === 'STOCK_OUT') {
      const productDoc = await Product.findById(product || transaction.product);
      if (productDoc && productDoc.quantityInStock < quantityMoved) {
        await Product.findByIdAndUpdate(transaction.product, { $inc: { quantityInStock: oldAdjustment } });
        return res.status(400).json({ success: false, message: 'Insufficient stock quantity' });
      }
    }

    const newAdjustment = transactionType === 'STOCK_IN' ? quantityMoved : -quantityMoved;
    await Product.findByIdAndUpdate(product || transaction.product, { $inc: { quantityInStock: newAdjustment } });

    const updated = await StockTransaction.findByIdAndUpdate(
      req.params.id,
      { transactionDate, quantityMoved, transactionType, product, warehouse },
      { new: true, runValidators: true }
    )
      .populate('product', 'productName productCode')
      .populate('warehouse', 'warehouseName warehouseCode');

    res.json({ success: true, message: 'Transaction updated successfully', data: updated });
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const transaction = await StockTransaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found' });

    const adjustment = transaction.transactionType === 'STOCK_IN' ? -transaction.quantityMoved : transaction.quantityMoved;
    await Product.findByIdAndUpdate(transaction.product, { $inc: { quantityInStock: adjustment } });

    await StockTransaction.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Transaction deleted successfully' });
  } catch (error) {
    next(error);
  }
};
