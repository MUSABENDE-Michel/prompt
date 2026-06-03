const Sale = require('../models/Sale');
const Product = require('../models/Product');
const StockStatus = require('../models/StockStatus');
const { generatePDF, generateCSV } = require('../utils/exportUtils');

exports.dailySalesReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const today = new Date();
    const start = startDate ? new Date(startDate) : new Date(today.setHours(0, 0, 0, 0));
    const end = endDate ? new Date(endDate + 'T23:59:59.999Z') : new Date(today.setHours(23, 59, 59, 999));

    const sales = await Sale.find({
      salesDate: { $gte: start, $lte: end },
    }).populate('product', 'productName category').sort({ salesDate: -1 });

    const reportData = sales.map((s) => ({
      'Product Name': s.product?.productName || 'N/A',
      'Category': s.product?.category || 'N/A',
      'Sold Quantity': s.soldQuantity,
      'Sold Unit Price': s.soldUnitPrice,
      'Sold Total Price': s.soldTotalPrice,
      'Sales Date': s.salesDate.toISOString().split('T')[0],
    }));

    const totalRevenue = sales.reduce((sum, s) => sum + s.soldTotalPrice, 0);
    const totalItems = sales.reduce((sum, s) => sum + s.soldQuantity, 0);
    const summary = {
      totalSales: sales.length,
      totalItems,
      totalRevenue,
      currency: 'RWF',
    };

    res.json({ success: true, data: { reportData, summary } });
  } catch (error) {
    next(error);
  }
};

exports.dailyStockStatusReport = async (req, res, next) => {
  try {
    const statuses = await StockStatus.find()
      .populate('product', 'productName category')
      .sort({ createdAt: -1 });

    const reportData = statuses
      .filter((s) => s.product)
      .map((s) => ({
        'Product Name': s.product.productName,
        'Stored Quantity': s.availableQuantity,
        'Sold Quantity': s.soldQuantity,
        'Remaining Quantity': s.remainingQuantity,
      }));

    res.json({ success: true, data: reportData });
  } catch (error) {
    next(error);
  }
};

exports.exportReport = async (req, res, next) => {
  try {
    const { type, format, startDate, endDate } = req.query;

    let reportData = [];
    if (type === 'sales') {
      const start = startDate ? new Date(startDate) : new Date(new Date().setHours(0, 0, 0, 0));
      const end = endDate ? new Date(endDate + 'T23:59:59.999Z') : new Date(new Date().setHours(23, 59, 59, 999));
      const sales = await Sale.find({
        salesDate: { $gte: start, $lte: end },
      }).populate('product', 'productName category').sort({ salesDate: -1 });

      reportData = sales.map((s) => ({
        'Product Name': s.product?.productName || 'N/A',
        'Category': s.product?.category || 'N/A',
        'Sold Quantity': s.soldQuantity,
        'Sold Unit Price': s.soldUnitPrice,
        'Sold Total Price': s.soldTotalPrice,
        'Sales Date': s.salesDate.toISOString().split('T')[0],
      }));
    } else if (type === 'stock') {
      const statuses = await StockStatus.find().populate('product', 'productName category');
      reportData = statuses
        .filter((s) => s.product)
        .map((s) => ({
          'Product Name': s.product.productName,
          'Stored Quantity': s.availableQuantity,
          'Sold Quantity': s.soldQuantity,
          'Remaining Quantity': s.remainingQuantity,
        }));
    }

    if (format === 'csv') {
      const csv = generateCSV(reportData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${type}_report.csv"`);
      return res.send(csv);
    }

    if (format === 'pdf') {
      const title = type === 'sales' ? 'Daily Sales Report' : 'Daily Stock Status Report';
      return generatePDF(reportData, title, res, req.user);
    }

    res.json({ success: true, data: reportData });
  } catch (error) {
    next(error);
  }
};
