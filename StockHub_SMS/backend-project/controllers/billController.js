const Bill = require('../models/Bill');
const StockTransaction = require('../models/StockTransaction');

exports.create = async (req, res, next) => {
  try {
    const { transactionId, customerName, customerContact, notes } = req.body;

    const transaction = await StockTransaction.findById(transactionId)
      .populate('product', 'productName productCode unitPrice');
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    if (transaction.transactionType !== 'STOCK_OUT') {
      return res.status(400).json({ success: false, message: 'Bills can only be generated for stock-out transactions' });
    }

    const existing = await Bill.findOne({ transaction: transactionId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A bill already exists for this transaction', data: existing });
    }

    const product = transaction.product;
    const quantity = transaction.quantityMoved;
    const unitPrice = product.unitPrice;
    const lineTotal = quantity * unitPrice;

    const bill = await Bill.create({
      transaction: transactionId,
      customerName,
      customerContact: customerContact || '',
      items: [{
        productName: product.productName,
        productCode: product.productCode,
        quantity,
        unitPrice,
        totalPrice: lineTotal,
      }],
      subtotal: lineTotal,
      tax: 0,
      totalAmount: lineTotal,
      generatedBy: req.user._id,
      notes: notes || '',
    });

    const populated = await Bill.findById(bill._id)
      .populate('transaction', 'transactionDate transactionType')
      .populate('generatedBy', 'username');

    res.status(201).json({ success: true, message: 'Invoice created successfully', data: populated });
  } catch (error) {
    next(error);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { billNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
      ];
    }
    const total = await Bill.countDocuments(query);
    const bills = await Bill.find(query)
      .populate('transaction', 'transactionDate transactionType')
      .populate('generatedBy', 'username')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({
      success: true,
      data: bills,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate('transaction', 'transactionDate transactionType')
      .populate('generatedBy', 'username');
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
    res.json({ success: true, data: bill });
  } catch (error) {
    next(error);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const bill = await Bill.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
    res.json({ success: true, message: 'Bill status updated', data: bill });
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const bill = await Bill.findByIdAndDelete(req.params.id);
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
    res.json({ success: true, message: 'Bill deleted successfully' });
  } catch (error) {
    next(error);
  }
};
