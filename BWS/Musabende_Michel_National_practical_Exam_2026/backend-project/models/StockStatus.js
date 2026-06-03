const mongoose = require('mongoose');

const stockStatusSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required'],
    unique: true,
  },
  availableQuantity: {
    type: Number,
    required: [true, 'Available quantity is required'],
    min: [0, 'Available quantity cannot be negative'],
    default: 0,
  },
  soldQuantity: {
    type: Number,
    default: 0,
    min: [0, 'Sold quantity cannot be negative'],
  },
  remainingQuantity: {
    type: Number,
    default: 0,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

stockStatusSchema.pre('save', function (next) {
  this.remainingQuantity = this.availableQuantity - this.soldQuantity;
  next();
});

module.exports = mongoose.model('StockStatus', stockStatusSchema);
