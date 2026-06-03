const auth = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no session',
    });
  }
  next();
};

module.exports = auth;
