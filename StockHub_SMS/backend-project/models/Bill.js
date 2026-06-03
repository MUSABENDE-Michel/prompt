const mongoose = require('mongoose');

const billItemSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  productCode: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
}, { _id: false });

const billSchema = new mongoose.Schema({
  billNumber: { type: String, required: true, unique: true },
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StockTransaction',
    required: true,
  },
  customerName: { type: String, required: [true, 'Customer name is required'] },
  customerContact: { type: String, default: '' },
  items: [billItemSchema],
  subtotal: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String, default: '' },
  status: {
    type: String,
    enum: ['paid', 'unpaid', 'cancelled'],
    default: 'unpaid',
  },
}, { timestamps: true });

billSchema.pre('validate', async function (next) {
  if (this.isNew && !this.billNumber) {
    const Counter = require('./Counter');
    try {
      const counter = await Counter.findOneAndUpdate(
        { entity: 'bill' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.billNumber = `INV-${String(counter.seq).padStart(4, '0')}`;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

module.exports = mongoose.model('Bill', billSchema);
