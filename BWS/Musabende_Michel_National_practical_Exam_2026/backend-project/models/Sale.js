const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required'],
  },
  soldQuantity: {
    type: Number,
    required: [true, 'Sold quantity is required'],
    min: [1, 'Sold quantity must be at least 1'],
  },
  soldUnitPrice: {
    type: Number,
    required: [true, 'Sold unit price is required'],
    min: [0, 'Sold unit price cannot be negative'],
  },
  soldTotalPrice: {
    type: Number,
    default: 0,
  },
  salesDate: {
    type: Date,
    required: [true, 'Sales date is required'],
    default: Date.now,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

saleSchema.pre('save', function (next) {
  this.soldTotalPrice = this.soldQuantity * this.soldUnitPrice;
  next();
});

module.exports = mongoose.model('Sale', saleSchema);
