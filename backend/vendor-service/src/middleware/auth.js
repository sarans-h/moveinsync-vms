const axios = require('axios');
const AppError = require('../utils/appError');
const { logger } = require('../utils/logger');
const jwt = require('jsonwebtoken');
const Vendor = require('../models/vendor.model');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  try {
    // 1) Get token from header or cookie
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return next(new AppError('You are not logged in. Please log in to get access.', 401));
    }

    // 2) Verify token
    try {
      // First try to verify as a vendor token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if vendor still exists
      const vendor = await Vendor.findById(decoded.id);
      if (!vendor) {
        return next(new AppError('The vendor belonging to this token no longer exists.', 401));
      }
      
      // Check if vendor is active
      if (!vendor.isActive) {
        return next(new AppError('Your account is inactive. Please contact support.', 403));
      }
      
      // Add vendor info to request
      req.user = {
        id: vendor._id,
        email: vendor.email,
        role: 'vendor',
        vendorId: vendor._id,
        vendorLevel: vendor.vendorLevel
      };
      
      next();
    } catch (vendorError) {
      // If vendor token verification fails, try to verify with auth service
      try {
        const response = await axios.post(`${process.env.AUTH_SERVICE_URL}/api/auth/verify-token`, {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // Add user info to request
        req.user = response.data.data.user;
        next();
      } catch (authError) {
        logger.error('Token verification failed:', authError.response?.data || authError.message);
        return next(new AppError('Invalid token. Please log in again.', 401));
      }
    }
  } catch (error) {
    next(error);
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