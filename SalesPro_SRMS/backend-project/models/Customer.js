const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    customerNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    telephone: {
      type: String,
      required: [true, 'Telephone is required'],
      trim: true,
      validate: {
        validator: function (v) {
          return /^(\+250|0)7[0-9]{8}$/.test(v);
        },
        message: () => 'Phone must be a valid Rwandan number (+2507XXXXXXXX or 07XXXXXXXX)',
      },
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

customerSchema.index({ customerNumber: 1 }, { unique: true });
customerSchema.index({ firstName: 1, lastName: 1 });

module.exports = mongoose.model('Customer', customerSchema);
