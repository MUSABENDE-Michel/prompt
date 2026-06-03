const auth = (req, res, next) => {
  if (req.session && req.session.userId) {
    req.user = {
      _id: req.session.userId,
      username: req.session.username,
      role: req.session.role,
    };
    next();
  } else {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. Please login.',
    });
  }
};

module.exports = auth;
