const AppError = require('../utils/appError');
const Vendor = require('../models/vendor.model');
const { logger } = require('../utils/logger');
// const redis = require('../utils/redis');
const ApiResponse = require('../utils/apiResponse');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');

// Generate JWT token for vendor
const generateToken = (vendorId) => {
  return jwt.sign(
    { id: vendorId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};


// Verify vendor token and return vendor info
exports.verifyVendor = catchAsync(async (req, res, next) => {
  // 1) Get token from header or cookie
  logger.info(JSON.stringify(req.headers));
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  } else if (req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.cookie && req.headers.cookie.startsWith('token=')) {
    token = req.headers.cookie.split('token=')[1];
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
    
    // Remove sensitive data
    vendor.password = undefined;
    
    // Return vendor info
    res.status(200).json(
      ApiResponse.success(
        { vendor },
        'Vendor verified successfully'
      )
    );
  } catch (error) {
    logger.error('Token verification failed:', error);
    return next(new AppError('Invalid token. Please log in again.', 401));
  }
});

// Login vendor
exports.loginVendor = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // 2) Check if vendor exists && password is correct
  const vendor = await Vendor.findOne({ email }).select('+password');
  
  if (!vendor || !(await vendor.comparePassword(password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3) Check if vendor is active
  if (!vendor.isActive) {
    return next(new AppError('Your account is inactive. Please contact support.', 403));
  }

  // 4) Update last login
  vendor.lastLogin = Date.now();
  await vendor.save({ validateBeforeSave: false });

  // 5) Generate token
  const token = generateToken(vendor._id);

  // 6) Remove password from output
  vendor.password = undefined;

  // 7) Set token in cookie
  

  res.cookie('jwt', token,  {
    httpOnly: true,
    secure: false, // Set to false for development
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });

  // 8) Send response
  res.status(200).json(
    ApiResponse.success(
      { vendor },
      'Vendor logged in successfully'
    )
  );
});

// Logout vendor
exports.logoutVendor = catchAsync(async (req, res) => {
  // Clear the JWT cookie
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  
  res.status(200).json(
    ApiResponse.success(
      null,
      'Vendor logged out successfully'
    )
  );
});

// Create new vendor
exports.createVendor = async (req, res, next) => {
  try {
    const vendor = await Vendor.create(req.body);

    

    res.status(201).json({
      status: 'success',
      data: {
        vendor,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Register a new vendor
exports.registerVendor = catchAsync(async (req, res, next) => {
  const {
    name,
    email,
    vendorLevel,
    identity,
    parentId,
    location,
    contact
  } = req.body;

  // Check if vendor with same email or identity exists
  const existingVendor = await Vendor.findOne({
    $or: [
      { email },
      { identity }
    ]
  });

  if (existingVendor) {
    return next(new AppError('Vendor with this email or identity already exists', 400));
  }

  // If parentId is provided, verify parent vendor exists
  if (parentId) {
    const parentVendor = await Vendor.findById(parentId);
    if (!parentVendor) {
      return next(new AppError('Parent vendor not found', 404));
    }
  }

  // Create new vendor
  const vendor = await Vendor.create({
    name,
    email,
    vendorLevel,
    identity,
    parentId,
    location,
    contact,
    status: 'inactive',
    isActive: false
  });

  // Return the vendor with its ID
  res.status(201).json({
    status: 'success',
    message: 'Vendor registered successfully',
    data: vendor
  });
});

// Get all vendors with pagination and filters
exports.getVendors = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, search, parentId, vendorLevel, status } = req.query;

  const query = { deletedAt: null };
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { identity: { $regex: search, $options: 'i' } }
    ];
  }

  if (parentId) query.parentId = parentId;
  if (vendorLevel) query.vendorLevel = vendorLevel;
  if (status) query.status = status;

  const vendors = await Vendor.find(query)
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .populate('parentId', 'name email vendorLevel');

  const total = await Vendor.countDocuments(query);

  res.json(new ApiResponse(200, 'Vendors retrieved successfully', {
    vendors,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    }
  }));
});

// Get a single vendor
exports.getVendor = catchAsync(async (req, res, next) => {
  const vendor = await Vendor.findById(req.params.id).populate('parentId', 'name email vendorLevel');

  if (!vendor || vendor.deletedAt) {
    return next(new AppError('Vendor not found', 404));
  }

  res.json(new ApiResponse(200, 'Vendor retrieved successfully', { vendor }));
});

// Update vendor
exports.updateVendor = catchAsync(async (req, res, next) => {
  const { name, email, location, contact, parentId } = req.body;
  const vendor = await Vendor.findById(req.params.id);

  if (!vendor || vendor.deletedAt) {
    return next(new AppError('Vendor not found', 404));
  }

  // Check if email is being changed and if it's already in use
  if (email && email !== vendor.email) {
    const existingVendor = await Vendor.findOne({ email });
    if (existingVendor) {
      return next(new AppError('Email already in use', 400));
    }
  }

  // If parentId is being updated, verify parent vendor exists
  if (parentId) {
    const parentVendor = await Vendor.findById(parentId);
    if (!parentVendor) {
      return next(new AppError('Parent vendor not found', 404));
    }
  }

  // Update vendor
  Object.assign(vendor, { name, email, location, contact, parentId });
  await vendor.save();

  res.json(new ApiResponse(200, 'Vendor updated successfully', { vendor }));
});

// Delete vendor (soft delete)
exports.deleteVendor = catchAsync(async (req, res, next) => {
  const vendor = await Vendor.findById(req.params.id);

  if (!vendor || vendor.deletedAt) {
    return next(new AppError('Vendor not found', 404));
  }

  // Check if vendor has children
  const hasChildren = await Vendor.exists({ parentId: vendor._id, deletedAt: null });
  if (hasChildren) {
    return next(new AppError('Cannot delete vendor with active child vendors', 400));
  }

  vendor.deletedAt = new Date();
  vendor.isActive = false;
  await vendor.save();

  res.json(new ApiResponse(200, 'Vendor deleted successfully'));
});

// Get vendor hierarchy
exports.getVendorHierarchy = catchAsync(async (req, res, next) => {
  console.log(`Getting hierarchy for vendor ID: ${req.params.id}`);
  const vendor = await Vendor.findById(req.params.id);

  if (!vendor || vendor.deletedAt) {
    return next(new AppError('Vendor not found', 404));
  }

  console.log(`Found vendor: ${vendor.name} (${vendor._id}) - Level: ${vendor.vendorLevel}`);
  const hierarchyPath = await vendor.getHierarchyPath();
  
  console.log(`Returning hierarchy path with ${hierarchyPath.length} vendors`);
  
  // Ensure we're returning the complete hierarchy path
  res.json(new ApiResponse(200, 'Vendor hierarchy retrieved successfully', { 
    hierarchyPath,
    count: hierarchyPath.length,
    currentVendor: {
      id: vendor._id,
      name: vendor.name,
      level: vendor.vendorLevel
    }
  }));
});

// Get vendor hierarchy tree
exports.getVendorHierarchyTree = catchAsync(async (req, res, next) => {
  console.log(`Getting hierarchy tree for vendor ID: ${req.params.id}`);
  const vendor = await Vendor.findById(req.params.id);

  if (!vendor || vendor.deletedAt) {
    return next(new AppError('Vendor not found', 404));
  }

  console.log(`Found vendor: ${vendor.name} (${vendor._id}) - Level: ${vendor.vendorLevel}`);
  const hierarchyTree = await vendor.getHierarchyTree();
  
  console.log(`Returning complete hierarchy tree for ${vendor.name}`);
  
  res.json(new ApiResponse(200, 'Vendor hierarchy tree retrieved successfully', { 
    hierarchyTree
  }));
});

// Get vendor children
exports.getVendorChildren = catchAsync(async (req, res, next) => {
  const vendor = await Vendor.findById(req.params.id);

  if (!vendor || vendor.deletedAt) {
    return next(new AppError('Vendor not found', 404));
  }

  const children = await Vendor.find({ parentId: vendor._id, deletedAt: null })
    .populate('parentId', 'name email vendorLevel');

  res.json(new ApiResponse(200, 'Vendor children retrieved successfully', { children }));
});

// Update vendor permissions
exports.updateVendorPermissions = async (req, res, next) => {
  try {
    const { permissions } = req.body;
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return next(new AppError('Vendor not found', 404));
    }

    // Validate permissions
    for (const permission of permissions) {
      const canDelegate = await vendor.canDelegatePermission(permission);
      if (!canDelegate) {
        return next(new AppError(`Cannot delegate permission: ${permission}`, 403));
      }
    }

    vendor.permissions = permissions;
    await vendor.save();

    // Invalidate cache
    // await redis.del(`vendor:${vendor._id}`);

    res.status(200).json({
      status: 'success',
      data: {
        vendor,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Register national vendor (called by auth service)
exports.registerNationalVendor = catchAsync(async (req, res, next) => {
  const { name, email, password, identity, location, contact } = req.body;

  // Check if vendor already exists
  const existingVendor = await Vendor.findOne({ 
    $or: [
      { email },
      { identity }
    ]
  });
  if (existingVendor) {
    return next(new AppError('Email or identity already registered', 400));
  }

  // Create national vendor with all permissions
  const vendor = await Vendor.create({
    name,
    email,
    password,
    vendorLevel: 'national',
    identity,
    location,
    contact,
    hierarchyLevel: 1,
    permissions: {
      createVendors: true,
      processPayments: true,
      vehicleOnboarding: true,
      driverOnboarding: true,
      assignVehicle: true
    },
    grantedPermissions: ['createVendors', 'processPayments', 'vehicleOnboarding', 'driverOnboarding', 'assignVehicle']
  });

  // Remove password from response
  vendor.password = undefined;

  // Send a simple response with just the message and vendor object
  res.status(201).json({
    status: 'success',
    message: 'National vendor created',
    data: {
      vendor
    }
  });
});

// Register sub-vendor (requires authentication)
exports.registerSubVendor = catchAsync(async (req, res, next) => {
  const { name, email, password, vendorLevel, location, contact } = req.body;

  // Get the authenticated vendor (parent)
  const parentVendor = await Vendor.findById(req.user.vendorId).select('+password');
  logger.info(parentVendor)
  if (!parentVendor) {
    return next(new AppError('Parent vendor not found', 404));
  }

  // Check if parent has permission to create vendors
  if (!parentVendor.permissions.createVendors) {
    return next(new AppError('You do not have permission to create vendors', 403));
  }

  // Validate vendor level hierarchy
  const validLevels = {
    'national': ['regional'],
    'regional': ['state'],
    'state': ['city'],
    'city': ['local']
  };

  if (!validLevels[parentVendor.vendorLevel].includes(vendorLevel)) {
    return next(new AppError(`You can only create ${validLevels[parentVendor.vendorLevel].join(' or ')} level vendors`, 400));
  }

  // Check if email already exists
  const existingVendor = await Vendor.findOne({ email });
  if (existingVendor) {
    return next(new AppError('Email already registered', 400));
  }

  // Generate vendor identity
  const identity = await Vendor.generateVendorIdentity(parentVendor.identity, vendorLevel, parentVendor._id);

  // Create sub-vendor
  const vendor = await Vendor.create({
    name,
    email,
    password,
    vendorLevel,
    hierarchyLevel: parentVendor.hierarchyLevel + 1,
    identity,
    parentId: parentVendor._id,
    location,
    contact 
  });

  // Remove password from response
  vendor.password = undefined;

  // Ensure the vendor object is properly serialized
  const vendorObj = vendor.toJSON();
  
  // Log the vendor object for debugging
  logger.info('Sub-vendor created:', JSON.stringify(vendorObj, null, 2));

  res.status(201).json(new ApiResponse(201, 'Sub-vendor registered successfully', { vendor: vendorObj }));
});

// Grant permission to child vendor
exports.grantPermission = catchAsync(async (req, res, next) => {
  const { childId, permission } = req.body;
  const parentVendor = await Vendor.findById(req.params.id).select('+password');

  if (!parentVendor) {
    return next(new AppError('Parent vendor not found', 404));
  }

  try {
    await parentVendor.grantPermission(childId, permission);
    res.json(new ApiResponse(200, 'Permission granted successfully'));
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});

// Revoke permission from child vendor
exports.revokePermission = catchAsync(async (req, res, next) => {
  const { childId, permission } = req.body;
  const parentVendor = await Vendor.findById(req.params.id).select('+password');

  if (!parentVendor) {
    return next(new AppError('Parent vendor not found', 404));
  }

  try {
    await parentVendor.revokePermission(childId, permission);
    res.json(new ApiResponse(200, 'Permission revoked successfully'));
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
}); 