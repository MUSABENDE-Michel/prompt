const Sale = require('../models/Sale');
const Product = require('../models/Product');
const StockStatus = require('../models/StockStatus');

exports.getAll = async (req, res, next) => {
  try {
    const { startDate, endDate, search } = req.query;
    let query = {};
    if (startDate && endDate) {
      query.salesDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate + 'T23:59:59.999Z'),
      };
    }
    if (search) {
      query.$or = [
        { 'product.productName': { $regex: search, $options: 'i' } },
      ];
    }
    const sales = await Sale.find(query)
      .populate('product', 'productName category')
      .sort({ salesDate: -1 });
    res.json({ success: true, data: sales });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.id).populate('product', 'productName category');
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
    const { product: productId, soldQuantity, soldUnitPrice, salesDate } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const qty = Number(soldQuantity);
    if (qty > product.quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available: ${product.quantity}, requested: ${qty}`,
      });
    }

    const sale = await Sale.create({
      product: productId,
      soldQuantity: qty,
      soldUnitPrice: Number(soldUnitPrice),
      salesDate: salesDate || new Date(),
      createdBy: req.user._id,
    });

    // Update product quantity
    product.quantity -= qty;
    await product.save();

    // Update stock status
    let stockStatus = await StockStatus.findOne({ product: productId });
    if (stockStatus) {
      stockStatus.soldQuantity += qty;
      stockStatus.availableQuantity = product.quantity;
      await stockStatus.save();
    }

    const populated = await Sale.findById(sale._id).populate('product', 'productName category');
    res.status(201).json({ success: true, message: 'Sale recorded successfully', data: populated });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { soldQuantity, soldUnitPrice, salesDate } = req.body;
    const oldSale = await Sale.findById(req.params.id);
    if (!oldSale) {
      return res.status(404).json({ success: false, message: 'Sale not found' });
    }

    const oldQty = oldSale.soldQuantity;
    const newQty = Number(soldQuantity);

    // Restore old quantity to product, then deduct new
    const product = await Product.findById(oldSale.product);
    if (product) {
      product.quantity = product.quantity + oldQty - newQty;
      if (product.quantity < 0) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock. Available after restore: ${product.quantity + oldQty}`,
        });
      }
      await product.save();

      await StockStatus.findOneAndUpdate(
        { product: product._id },
        {
          availableQuantity: product.quantity,
          soldQuantity: product.quantity >= 0 ? newQty : 0,
        }
      );
    }

    const sale = await Sale.findByIdAndUpdate(
      req.params.id,
      { soldQuantity: newQty, soldUnitPrice: Number(soldUnitPrice), salesDate },
      { new: true, runValidators: true }
    ).populate('product', 'productName category');

    res.json({ success: true, message: 'Sale updated successfully', data: sale });
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ success: false, message: 'Sale not found' });
    }

    // Restore product quantity
    const product = await Product.findById(sale.product);
    if (product) {
      product.quantity += sale.soldQuantity;
      await product.save();

      await StockStatus.findOneAndUpdate(
        { product: product._id },
        { availableQuantity: product.quantity, soldQuantity: Math.max(0, product.soldQuantity - sale.soldQuantity) }
      );
    }

    await Sale.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Sale deleted successfully' });
  } catch (error) {
    next(error);
  }
};
