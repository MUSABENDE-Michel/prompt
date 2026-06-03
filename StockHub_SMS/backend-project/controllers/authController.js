const User = require('../models/User');

exports.register = async (req, res, next) => {
  try {
    const { username, email, password, securityQuestion, securityAnswer } = req.body;
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email ? 'Email already exists' : 'Username already exists',
      });
    }
    const user = await User.create({
      username,
      email,
      password,
      role: 'admin',
      securityQuestion,
      securityAnswer,
    });
    req.session.userId = user._id;
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { id: user._id, username: user.username, email: user.email, role: user.role },
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    req.session.userId = user._id;
    res.json({
      success: true,
      message: 'Login successful',
      data: { id: user._id, username: user.username, email: user.email, role: user.role },
    });
  } catch (error) {
    next(error);
  }
};

exports.logout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie('connect.sid');
    res.json({ success: true, message: 'Logged out successfully' });
  });
};

exports.getSession = async (req, res, next) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    const user = await User.findById(req.session.userId);
    if (!user) {
      req.session.destroy();
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    res.json({
      success: true,
      data: { id: user._id, username: user.username, email: user.email, role: user.role },
    });
  } catch (error) {
    next(error);
  }
};

exports.getSecurityQuestion = async (req, res, next) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: { securityQuestion: user.securityQuestion } });
  } catch (error) {
    next(error);
  }
};

exports.recoverPassword = async (req, res, next) => {
  try {
    const { username, securityAnswer, newPassword } = req.body;
    const user = await User.findOne({ username }).select('+securityAnswer +password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (!(await user.compareSecurityAnswer(securityAnswer))) {
      return res.status(400).json({ success: false, message: 'Incorrect security answer' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
};
