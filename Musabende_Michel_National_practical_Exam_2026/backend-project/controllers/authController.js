const User = require('../models/User');

const generateCustomerNumber = async () => {
  const count = await Customer.countDocuments();
  return `CUST${String(count + 1).padStart(5, '0')}`;
};

const generateProductCode = async () => {
  const count = await Product.countDocuments();
  return `PROD${String(count + 1).padStart(5, '0')}`;
};

const generateInvoiceNumber = async () => {
  const count = await Sale.countDocuments();
  const year = new Date().getFullYear();
  return `INV-${year}-${String(count + 1).padStart(5, '0')}`;
};

// Inline requires to avoid circular issues
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const Sale = require('../models/Sale');

exports.register = async (req, res, next) => {
  try {
    const { username, password, securityQuestion, securityAnswer } = req.body;

    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists',
      });
    }

    const user = await User.create({
      username,
      password,
      role: 'admin',
      securityQuestion,
      securityAnswer,
    });

    req.session.userId = user._id;
    req.session.username = user.username;
    req.session.role = user.role;

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        _id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username: username.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
      });
    }

    req.session.userId = user._id;
    req.session.username = user.username;
    req.session.role = user.role;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Logout failed',
      });
    }
    res.clearCookie('connect.sid');
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  });
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }
    res.json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getSecurityQuestion = async (req, res, next) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username: username.toLowerCase() }).select('+securityQuestion');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    res.json({
      success: true,
      data: { securityQuestion: user.securityQuestion },
    });
  } catch (error) {
    next(error);
  }
};

exports.recoverPassword = async (req, res, next) => {
  try {
    const { username, securityAnswer, newPassword } = req.body;

    const user = await User.findOne({ username: username.toLowerCase() }).select(
      '+securityAnswer +password'
    );
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const isMatch = await user.matchSecurityAnswer(securityAnswer);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Security answer is incorrect',
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password recovered successfully',
    });
  } catch (error) {
    next(error);
  }
};

exports.checkSession = async (req, res) => {
  if (req.session && req.session.userId) {
    return res.json({
      success: true,
      data: {
        _id: req.session.userId,
        username: req.session.username,
        role: req.session.role,
      },
    });
  }
  res.json({ success: false });
};

exports.generateCode = async (req, res, next) => {
  try {
    const { type } = req.params;
    let code;
    switch (type) {
      case 'customer':
        code = await generateCustomerNumber();
        break;
      case 'product':
        code = await generateProductCode();
        break;
      case 'invoice':
        code = await generateInvoiceNumber();
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid type' });
    }
    res.json({ success: true, data: { code } });
  } catch (error) {
    next(error);
  }
};
