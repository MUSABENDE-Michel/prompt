const Sale = require('../models/Sale');

const generateInvoiceNumber = async () => {
  const lastSale = await Sale.findOne().sort({ createdAt: -1 });
  const lastNum = lastSale
    ? parseInt(lastSale.invoiceNumber.split('-')[2], 10)
    : 0;
  const year = new Date().getFullYear();
  return `INV-${year}-${String(lastNum + 1).padStart(5, '0')}`;
};

exports.getAll = async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
      ];
    }
    const sales = await Sale.find(query)
      .populate('customer', 'firstName lastName customerNumber')
      .populate('products.product', 'productName productCode')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: sales });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('customer')
      .populate('products.product');
    if (!sale) {
      return res.status(404).json({ success: false, message: 'Sale not found' });
    }
    res.json({ success: true, data: sale });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const invoiceNumber = await generateInvoiceNumber();
    const sale = await Sale.create({
      ...req.body,
      invoiceNumber,
      createdBy: req.session.userId,
    });
    const populated = await Sale.findById(sale._id)
      .populate('customer', 'firstName lastName customerNumber')
      .populate('products.product', 'productName productCode');
    res.status(201).json({ success: true, message: 'Sale recorded', data: populated });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const sale = await Sale.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('customer', 'firstName lastName customerNumber')
      .populate('products.product', 'productName productCode');
    if (!sale) {
      return res.status(404).json({ success: false, message: 'Sale not found' });
    }
    res.json({ success: true, message: 'Sale updated', data: sale });
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const sale = await Sale.findByIdAndDelete(req.params.id);
    if (!sale) {
      return res.status(404).json({ success: false, message: 'Sale not found' });
    }
    res.json({ success: true, message: 'Sale deleted' });
  } catch (error) {
    next(error);
  }
};
