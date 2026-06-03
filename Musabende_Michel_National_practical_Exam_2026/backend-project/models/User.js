const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'Username must be at least 3 characters'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      default: 'admin',
      enum: ['admin'],
    },
    securityQuestion: {
      type: String,
      required: [true, 'Security question is required'],
      select: false,
    },
    securityAnswer: {
      type: String,
      required: [true, 'Security answer is required'],
      select: false,
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('securityAnswer')) return next();
  const salt = await bcrypt.genSalt(10);
  this.securityAnswer = await bcrypt.hash(this.securityAnswer, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.matchSecurityAnswer = async function (enteredAnswer) {
  return await bcrypt.compare(enteredAnswer, this.securityAnswer);
};

module.exports = mongoose.model('User', userSchema);
