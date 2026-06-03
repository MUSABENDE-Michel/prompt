const express = require('express');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', auth, authController.logout);
router.get('/session', auth, authController.getSession);
router.get('/security-question/:username', authController.getSecurityQuestion);
router.post('/recover-password', authController.recoverPassword);

module.exports = router;
