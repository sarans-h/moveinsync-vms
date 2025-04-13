const jwt = require('jsonwebtoken');
const { AppError } = require('../middleware/errorHandler');
const User = require('../models/user.model');
const { logger } = require('../utils/logger');
const axios = require('axios');

// Generate token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Register new user
exports.register = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email already registered', 400));
    }

let newVendorId=null;
    // If role is vendor and no vendorId is provided, create a national vendor
    if (role === 'vendor') {
      try {
        // Extract all vendor details from request body
        const {
          name,
          email,
          password,
          identity,
          location,
          contact,
        } = req.body;
        
        // Validate required vendor fields
        if (!name || !identity || !location || !contact) {
          return next(new AppError('Missing required vendor information', 400));
        }
        
        // Create a national vendor with all provided details
        const vendorData = {
          name,
          email,
          password,
          identity,
          location,
          contact
        };
        
      
        // Create the national vendor
        const vendorResponse = await axios.post('http://localhost:3002/api/vendors/register/national', vendorData);
        
        // Log the vendor from the response
        logger.info('Vendor from response:', vendorResponse.data.data.vendor);
        
        // Extract vendor ID from the response
         newVendorId = vendorResponse.data.data.vendor._id;
        logger.info(`Using vendor ID: ${newVendorId}`);
      } catch (error) {
        logger.error('Error creating national vendor:', error.response?.data || error.message);
        return next(new AppError('Failed to create national vendor account: ' + (error.response?.data?.message || error.message), 500));
      }
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      role,
      vendorId: newVendorId,
    });

    // Generate token
    const token = user.generateAuthToken();

    // Remove password from output
    user.password = undefined;

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user,
        vendorId: newVendorId
      },
    });
  } catch (error) {
    next(error);
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if email and password exist
    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    // Check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    // Check if user is active
    if (!user.isActive) {
      return next(new AppError('Your account has been deactivated', 401));
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    // Generate token
    const token = user.generateAuthToken();

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: false, // Set to false for development
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    // Remove password from output
    user.password = undefined;

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Refresh token
exports.refreshToken = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return next(new AppError('Please provide a token', 400));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError('User no longer exists', 401));
    }

    // Check if user is active
    if (!user.isActive) {
      return next(new AppError('Your account has been deactivated', 401));
    }

    // Generate new token
    const newToken = user.generateAuthToken();

    res.status(200).json({
      status: 'success',
      token: newToken,
    });
  } catch (error) {
    next(error);
  }
};

// Get current user
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};
