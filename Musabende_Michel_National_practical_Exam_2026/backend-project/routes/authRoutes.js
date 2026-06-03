const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
  getSecurityQuestion,
  recoverPassword,
  checkSession,
  generateCode,
} = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', auth, getMe);
router.get('/session', checkSession);
router.get('/security-question/:username', getSecurityQuestion);
router.post('/recover-password', recoverPassword);
router.get('/generate-code/:type', auth, generateCode);

module.exports = router;
