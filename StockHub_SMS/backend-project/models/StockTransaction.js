const mongoose = require('mongoose');

const stockTransactionSchema = new mongoose.Schema({
  transactionDate: {
    type: Date,
    required: [true, 'Transaction date is required'],
    default: Date.now,
  },
  quantityMoved: {
    type: Number,
    required: [true, 'Quantity moved is required'],
    min: [1, 'Quantity must be at least 1'],
  },
  transactionType: {
    type: String,
    required: [true, 'Transaction type is required'],
    enum: {
      values: ['STOCK_IN', 'STOCK_OUT'],
      message: '{VALUE} is not a valid transaction type',
    },
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required'],
  },
  warehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: [true, 'Warehouse is required'],
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

stockTransactionSchema.index({ transactionDate: -1 });
stockTransactionSchema.index({ product: 1, transactionDate: -1 });

module.exports = mongoose.model('StockTransaction', stockTransactionSchema);
