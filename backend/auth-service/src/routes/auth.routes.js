const express = require('express');
const { body } = require('express-validator');
const { validateRequest } = require('../middleware/validateRequest');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const {
  register,
  login,
  refreshToken,
  getMe,
  updatePassword,
} = require('../controllers/auth.controller');

const router = express.Router();

// Validation middleware
const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/\d/)
    .withMessage('Password must contain at least one number')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter'),
  body('role')
    .isIn(['admin', 'vendor', 'driver'])
    .withMessage('Invalid role specified'),
  validateRequest,
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validateRequest,
];



// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/refresh-token', refreshToken);

// Protected routes
router.use(protect); // All routes after this middleware will be protected
router.get('/me', getMe);

// Admin only routes

module.exports = router; 