const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
  },
  role: {
    type: String,
    default: 'admin',
    enum: ['admin'],
  },
  securityQuestion: {
    type: String,
    required: [true, 'Security question is required'],
  },
  securityAnswer: {
    type: String,
    required: [true, 'Security answer is required'],
  },
  phone: {
    type: String,
    trim: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
