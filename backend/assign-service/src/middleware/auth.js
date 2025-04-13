const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const axios = require('axios');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  try {
    logger.info('=== Starting protect middleware ===');
    // 1) Get token from header
    const token = req.cookies.jwt;
    if (!token) {
      logger.warn('No token found in cookies');
      return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    // logger.info('Token found in cookies, attempting vendor verification...');
    // Check if the vendor is logged in and has permission to onboard drivers
    const vendorResponse = await axios.get(`${process.env.VENDOR_SERVICE_URL}/api/vendors/verify`, {
      headers: {
        Cookie: `jwt=${token}`
      }
    });
    // logger.info('Vendor verification response:', vendorResponse.data);

    if (!vendorResponse.data || !vendorResponse.data.data || !vendorResponse.data.data.vendor) {
      logger.warn('Authentication attempt with invalid vendor data');
      return res.status(403).json({ message: 'Vendor not found' });
    }

    const vendor = vendorResponse.data.data.vendor;
    // logger.info('Vendor data:', vendor);

    // Check if the vendor is active
    if (!vendor.isActive) {
      logger.warn(`Authentication attempt by inactive vendor: ${vendor._id}`);
      return res.status(403).json({ message: 'Vendor is not active' });
    }

    // Check if the vendor has permission to onboard drivers
    if (!vendor.permissions || !vendor.permissions.assignVehicle) {//have to change it to assign vehicle
      logger.warn(`Vendor ${vendor._id} attempted to access driver service without assignVehicle permission`);
      return res.status(403).json({ message: 'Vendor does not have permission to assign vehicle' });
    }

    // Add vendor info to the request
    req.vendor = {
      id: vendor._id,
      identity: vendor.identity,
      permissions: vendor.permissions
    };
    // logger.info('Vendor info added to request:', req.vendor);

    logger.info('=== Protect middleware completed successfully ===');
    next();
  } catch (error) {
    logger.error('Error in protect middleware:', error);
    return next(new AppError('Authentication failed', 401));
  }
};

// Restrict to certain roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes('vendor')) {
      logger.warn(`User attempted to access restricted route`);
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
}; 