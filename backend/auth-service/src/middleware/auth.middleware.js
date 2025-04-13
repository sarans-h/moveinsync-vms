const jwt = require('jsonwebtoken');
const { AppError } = require('../middleware/errorHandler');
const User = require('../models/user.model');
const { logger } = require('../utils/logger');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  try {
    // 1) Get token from cookie or header
    let token;
    
    // Check cookie first
    if (req.cookies &&( req.cookies.token||req.cookies.jwt)) {
      token = req.cookies.token||req.cookies.jwt;
      logger.info(token)
    }
    // If no cookie, check Authorization header
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in. Please log in to get access.', 401));
    }

    //  Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    // 4) Add user to request
    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return next(new AppError('Authentication failed. Please log in again.', 401));
  }
};

// Restrict to certain roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

// Check if user is accessing their own data or is an admin
exports.isOwnerOrAdmin = (model) => async (req, res, next) => {
  try {
    const resource = await model.findById(req.params.id);

    if (!resource) {
      return next(new AppError('No resource found with that ID', 404));
    }

    if (
      req.user.role !== 'admin' &&
      resource.vendorId.toString() !== req.user.vendorId.toString()
    ) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  } catch (error) {
    next(error);
  }
}; 