const Customer = require('../models/Customer');
const Product = require('../models/Product');
const Sale = require('../models/Sale');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalCustomers = await Customer.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalSales = await Sale.countDocuments();

    const salesAgg = await Sale.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmountPaid' } } },
    ]);
    const totalRevenue = salesAgg.length > 0 ? salesAgg[0].totalRevenue : 0;

    const recentSales = await Sale.find()
      .populate('customer', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5);

    const lowStockProducts = await Product.find({ quantitySold: { $lte: 0 } })
      .sort({ quantitySold: 1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        totalCustomers,
        totalProducts,
        totalSales,
        totalRevenue,
        recentSales,
        lowStockProducts,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getReport = async (req, res, next) => {
  try {
    const { type, startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter = {};
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.$lte = end;
      }
    }

    let data;
    let title;

    switch (type) {
      case 'customers':
        title = 'Customer Report';
        data = await Customer.find(
          dateFilter.$gte || dateFilter.$lte ? { createdAt: dateFilter } : {}
        ).sort({ createdAt: -1 });
        break;
      case 'products':
        title = 'Product Report';
        data = await Product.find(
          dateFilter.$gte || dateFilter.$lte ? { createdAt: dateFilter } : {}
        ).sort({ createdAt: -1 });
        break;
      case 'sales':
        title = 'Sales Report';
        data = await Sale.find(
          dateFilter.$gte || dateFilter.$lte ? { salesDate: dateFilter } : {}
        )
          .populate('customer', 'firstName lastName customerNumber')
          .populate('products.product', 'productName productCode unitPrice')
          .sort({ salesDate: -1 });
        break;
      default:
        title = 'Sales Report';
        data = await Sale.find(
          dateFilter.$gte || dateFilter.$lte ? { salesDate: dateFilter } : {}
        )
          .populate('customer', 'firstName lastName customerNumber')
          .populate('products.product', 'productName productCode unitPrice')
          .sort({ salesDate: -1 });
    }

    const reportId = `RPT-${Date.now()}`;
    const generatedBy = req.session.username || 'admin';

    res.json({
      success: true,
      data: {
        title,
        reportId,
        generatedBy,
        generatedAt: new Date().toISOString(),
        records: data,
        totalRecords: data.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.exportReport = async (req, res, next) => {
  try {
    const { type, format, startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate || endDate) {
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.$lte = end;
      }
    }

    let records;
    switch (type) {
      case 'customers':
        records = await Customer.find(
          dateFilter.$gte || dateFilter.$lte ? { createdAt: dateFilter } : {}
        ).lean();
        break;
      case 'products':
        records = await Product.find(
          dateFilter.$gte || dateFilter.$lte ? { createdAt: dateFilter } : {}
        ).lean();
        break;
      case 'sales':
      default:
        records = await Sale.find(
          dateFilter.$gte || dateFilter.$lte ? { salesDate: dateFilter } : {}
        )
          .populate('customer', 'firstName lastName')
          .populate('products.product', 'productName')
          .lean();
    }

    res.json({
      success: true,
      data: { records, format, type, generatedBy: req.session.username },
    });
  } catch (error) {
    next(error);
  }
};
