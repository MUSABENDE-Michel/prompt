const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const authController = require('../controllers/authController');

router.post(
  '/register',
  [
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('securityQuestion').notEmpty().withMessage('Security question is required'),
    body('securityAnswer').notEmpty().withMessage('Security answer is required'),
  ],
  validate,
  authController.register
);

router.post(
  '/login',
  [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  authController.login
);

router.post('/logout', auth, authController.logout);

router.get('/session', auth, authController.checkSession);

router.get('/security-question/:username', authController.getSecurityQuestion);

router.post(
  '/verify-answer',
  [
    body('username').trim().notEmpty(),
    body('answer').notEmpty().withMessage('Answer is required'),
  ],
  validate,
  authController.verifyAnswer
);

router.post(
  '/reset-password',
  [
    body('resetToken').notEmpty(),
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  authController.resetPassword
);

module.exports = router;
