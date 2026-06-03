const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    salesDate: {
      type: Date,
      required: [true, 'Sales date is required'],
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
      enum: ['Cash', 'Mobile Money', 'Credit Card', 'Bank Transfer'],
    },
    totalAmountPaid: {
      type: Number,
      required: [true, 'Total amount paid is required'],
      min: [0, 'Amount cannot be negative'],
      default: 0,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer reference is required'],
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, 'Quantity must be at least 1'],
        },
        unitPrice: {
          type: Number,
          required: true,
          min: [0, 'Price cannot be negative'],
        },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

saleSchema.index({ invoiceNumber: 1 }, { unique: true });
saleSchema.index({ salesDate: 1 });
saleSchema.index({ customer: 1 });

module.exports = mongoose.model('Sale', saleSchema);
