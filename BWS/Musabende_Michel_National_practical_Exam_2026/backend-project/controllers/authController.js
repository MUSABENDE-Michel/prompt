const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.register = async (req, res, next) => {
  try {
    const { username, email, password, securityQuestion, securityAnswer, phone } = req.body;

    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          existingUser.username === username
            ? 'Username already exists'
            : 'Email already exists',
      });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    const hashedAnswer = await bcrypt.hash(securityAnswer.toLowerCase().trim(), salt);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: 'admin',
      securityQuestion,
      securityAnswer: hashedAnswer,
      phone,
    });

    req.session.userId = user._id;
    req.session.username = user.username;
    req.session.role = user.role;

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: { _id: user._id, username: user.username, email: user.email, role: user.role },
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    req.session.userId = user._id;
    req.session.username = user.username;
    req.session.role = user.role;

    res.json({
      success: true,
      message: 'Login successful',
      data: { _id: user._id, username: user.username, email: user.email, role: user.role },
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

exports.checkSession = async (req, res, next) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const user = await User.findById(req.session.userId).select('-password -securityAnswer');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      data: { _id: user._id, username: user.username, email: user.email, role: user.role },
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

exports.verifyAnswer = async (req, res, next) => {
  try {
    const { username, answer } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(answer.toLowerCase().trim(), user.securityAnswer);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect answer' });
    }

    // Generate a temporary reset token
    const resetToken = Math.random().toString(36).slice(2) + Date.now().toString(36);
    req.session.resetToken = resetToken;
    req.session.resetUserId = user._id;

    res.json({ success: true, message: 'Answer verified', data: { resetToken } });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!req.session.resetToken || req.session.resetToken !== resetToken) {
      return res.status(401).json({ success: false, message: 'Invalid or expired reset token' });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.findByIdAndUpdate(req.session.resetUserId, { password: hashedPassword });

    delete req.session.resetToken;
    delete req.session.resetUserId;

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
};
