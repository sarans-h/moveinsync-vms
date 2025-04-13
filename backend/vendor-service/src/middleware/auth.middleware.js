const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const Vendor = require('../models/vendor.model');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Get token from header
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in. Please log in to get access.', 401)
    );
  }

  // 2) Verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if vendor still exists
  const vendor = await Vendor.findById(decoded.id);
  if (!vendor) {
    return next(
      new AppError('The vendor belonging to this token no longer exists.', 401)
    );
  }

  // 4) Check if vendor changed password after the token was issued
  if (vendor.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('Vendor recently changed password. Please log in again.', 401)
    );
  }

  // Grant access to protected route
  req.vendor = vendor;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.vendor.type)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

exports.validateApiKey = catchAsync(async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return next(new AppError('API key is required', 401));
  }

  const vendor = await Vendor.findByApiKey(apiKey);

  if (!vendor || !vendor.isApiKeyValid(apiKey)) {
    return next(new AppError('Invalid or expired API key', 401));
  }

  req.vendor = vendor;
  next();
});

exports.checkVendorAccess = catchAsync(async (req, res, next) => {
  const targetVendorId = req.params.id || req.body.vendorId;

  if (!targetVendorId) {
    return next(new AppError('Vendor ID is required', 400));
  }

  const targetVendor = await Vendor.findById(targetVendorId);

  if (!targetVendor) {
    return next(new AppError('Target vendor not found', 404));
  }

  if (!req.vendor.canManageVendor(targetVendor)) {
    return next(
      new AppError('You do not have permission to manage this vendor', 403)
    );
  }

  req.targetVendor = targetVendor;
  next();
}); 