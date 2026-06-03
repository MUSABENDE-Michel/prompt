const Product = require('../models/Product');
const StockTransaction = require('../models/StockTransaction');

exports.getDashboard = async (req, res, next) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalStock = await Product.aggregate([
      { $group: { _id: null, total: { $sum: '$quantityInStock' } } },
    ]);
    const totalValue = await Product.aggregate([
      { $group: { _id: null, total: { $sum: { $multiply: ['$quantityInStock', '$unitPrice'] } } } },
    ]);
    const recentTransactions = await StockTransaction.find()
      .populate('product', 'productName')
      .populate('warehouse', 'warehouseName')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        totalProducts,
        totalStock: totalStock[0]?.total || 0,
        totalValue: totalValue[0]?.total || 0,
        recentTransactions,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getStockReport = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ productName: 1 });
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

exports.getStockInReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { transactionType: 'STOCK_IN' };
    if (startDate && endDate) {
      query.transactionDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    const transactions = await StockTransaction.find(query)
      .populate('product', 'productName productCode')
      .populate('warehouse', 'warehouseName')
      .sort({ transactionDate: -1 });
    const totalQuantity = transactions.reduce((sum, t) => sum + t.quantityMoved, 0);
    res.json({ success: true, data: { transactions, totalQuantity, count: transactions.length } });
  } catch (error) {
    next(error);
  }
};

exports.getStockOutReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { transactionType: 'STOCK_OUT' };
    if (startDate && endDate) {
      query.transactionDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    const transactions = await StockTransaction.find(query)
      .populate('product', 'productName productCode')
      .populate('warehouse', 'warehouseName')
      .sort({ transactionDate: -1 });
    const totalQuantity = transactions.reduce((sum, t) => sum + t.quantityMoved, 0);
    res.json({ success: true, data: { transactions, totalQuantity, count: transactions.length } });
  } catch (error) {
    next(error);
  }
};

exports.getDailyReport = async (req, res, next) => {
  try {
    const { date } = req.query;
    const queryDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(queryDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(queryDate.setHours(23, 59, 59, 999));

    const transactions = await StockTransaction.find({
      transactionDate: { $gte: startOfDay, $lte: endOfDay },
    })
      .populate('product', 'productName productCode')
      .populate('warehouse', 'warehouseName')
      .sort({ transactionDate: -1 });

    const stockIn = transactions.filter(t => t.transactionType === 'STOCK_IN').reduce((s, t) => s + t.quantityMoved, 0);
    const stockOut = transactions.filter(t => t.transactionType === 'STOCK_OUT').reduce((s, t) => s + t.quantityMoved, 0);

    const products = await Product.find();

    res.json({
      success: true,
      data: {
        date: startOfDay.toISOString().split('T')[0],
        transactions,
        stockIn,
        stockOut,
        products,
        count: transactions.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getWeeklyReport = async (req, res, next) => {
  try {
    const { startDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date();
    start.setDate(start.getDate() - start.getDay());
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    const transactions = await StockTransaction.find({
      transactionDate: { $gte: start, $lte: end },
    })
      .populate('product', 'productName productCode')
      .populate('warehouse', 'warehouseName')
      .sort({ transactionDate: -1 });

    const stockIn = transactions.filter(t => t.transactionType === 'STOCK_IN').reduce((s, t) => s + t.quantityMoved, 0);
    const stockOut = transactions.filter(t => t.transactionType === 'STOCK_OUT').reduce((s, t) => s + t.quantityMoved, 0);

    const products = await Product.find();

    res.json({
      success: true,
      data: {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
        transactions,
        stockIn,
        stockOut,
        products,
        count: transactions.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getMonthlyReport = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const m = month ? parseInt(month) : now.getMonth();
    const y = year ? parseInt(year) : now.getFullYear();
    const start = new Date(y, m, 1);
    const end = new Date(y, m + 1, 0, 23, 59, 59, 999);

    const transactions = await StockTransaction.find({
      transactionDate: { $gte: start, $lte: end },
    })
      .populate('product', 'productName productCode')
      .populate('warehouse', 'warehouseName')
      .sort({ transactionDate: -1 });

    const stockIn = transactions.filter(t => t.transactionType === 'STOCK_IN').reduce((s, t) => s + t.quantityMoved, 0);
    const stockOut = transactions.filter(t => t.transactionType === 'STOCK_OUT').reduce((s, t) => s + t.quantityMoved, 0);

    const products = await Product.find();

    res.json({
      success: true,
      data: {
        month: m + 1,
        year: y,
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
        transactions,
        stockIn,
        stockOut,
        products,
        count: transactions.length,
      },
    });
  } catch (error) {
    next(error);
  }
};
