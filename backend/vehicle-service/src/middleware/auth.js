const axios = require('axios');
const AppError = require('../utils/appError');
const { logger } = require('../utils/logger');
const jwt = require('jsonwebtoken');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  
    try {
        // Get the token from cookies
        const token = req.cookies.jwt;
        
        if (!token) {
          logger.warn('Authentication attempt without token');
          return res.status(401).json({ message: 'No token provided' });
        }
        logger.info(token);
        // Check if the vendor is logged in and has permission to onboard drivers
        const vendorResponse = await axios.get(`${process.env.VENDOR_SERVICE_URL}/api/vendors/verify`, {
          headers: {
            Cookie: `jwt=${token}`
          }
        });
        logger.info(vendorResponse);
    
        // Check if the vendor exists and is active
        if (!vendorResponse.data || !vendorResponse.data.data || !vendorResponse.data.data.vendor) {
          logger.warn('Authentication attempt with invalid vendor data');
          return res.status(403).json({ message: 'Vendor not found' });
        }
    
        const vendor = vendorResponse.data.data.vendor;
    
        // Check if the vendor is active
        if (!vendor.isActive) {
          logger.warn(`Authentication attempt by inactive vendor: ${vendor._id}`);
          return res.status(403).json({ message: 'Vendor is not active' });
        }
    
        // Check if the vendor has permission to onboard drivers
        if (!vendor.permissions || !vendor.permissions.vehicleOnboarding) {
          logger.warn(`Vendor ${vendor._id} attempted to access driver service without driverOnboarding permission`);
          return res.status(403).json({ message: 'Vendor does not have permission to onboard drivers' });
        }
    
        // Add vendor info to the request
        req.vendor = {
          id: vendor._id,
          ...vendor
        };
    
        logger.info(`Vendor ${vendor._id} authenticated successfully`);
        next();
    }
   catch (error) {
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

// Check if vendor has specific permission
exports.hasPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user.permissions || !req.user.permissions[permission]) {
      return next(new AppError(`You do not have permission to ${permission}`, 403));
    }
    next();
  };
}; 