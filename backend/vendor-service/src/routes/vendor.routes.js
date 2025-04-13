const express = require('express');
const { body, query, param } = require('express-validator');
const { validateRequest } = require('../middleware/validateRequest');
const { protect, restrictTo } = require('../middleware/auth');
const vendorController = require('../controllers/vendor.controller');

const router = express.Router();

// Validation middleware
const vendorValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('location.address').notEmpty().withMessage('Address is required'),
  body('location.city').notEmpty().withMessage('City is required'),
  body('location.state').notEmpty().withMessage('State is required'),
  body('location.country').notEmpty().withMessage('Country is required'),
  body('contact.phone').matches(/^\+?[\d\s-]+$/).withMessage('Please provide a valid phone number'),
  validateRequest
];

const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  validateRequest
];

const subVendorValidation = [
  ...vendorValidation,
  body('vendorLevel').isIn(['regional', 'state', 'city', 'local']).withMessage('Invalid vendor level'),
  validateRequest
];

const permissionValidation = [
  body('childId').isMongoId().withMessage('Invalid child vendor ID'),
  body('permission').isIn(['createVendors', 'processPayments', 'vehicleOnboarding', 'driverOnboarding', 'assignVehicle'])
    .withMessage('Invalid permission'),
  validateRequest
];

const queryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(['active', 'inactive', 'suspended'])
    .withMessage('Invalid status'),
  query('search')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Search query cannot be empty'),
  query('parentId')
    .optional()
    .isMongoId()
    .withMessage('Invalid parent vendor ID'),
  query('vendorLevel')
    .optional()
    .isIn(['national', 'regional', 'state', 'city', 'local'])
    .withMessage('Invalid vendor level'),
  query('identity')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Vendor identity cannot be empty'),
  validateRequest,
];

const permissionsValidation = [
  param('id').isMongoId().withMessage('Invalid vendor ID'),
  body('permissions')
    .isArray()
    .withMessage('Permissions must be an array')
    .notEmpty()
    .withMessage('At least one permission is required'),
  body('permissions.*')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Each permission must be a non-empty string'),
  validateRequest,
];

// Public routes
router.get('/verify', vendorController.verifyVendor);
router.post('/login', loginValidation, vendorController.loginVendor);
router.post('/logout', vendorController.logoutVendor);
router.post('/register/national', vendorValidation, vendorController.registerNationalVendor);
router.get('/', queryValidation, vendorController.getVendors);
router.get('/:id', param('id').isMongoId().withMessage('Invalid vendor ID'), validateRequest, vendorController.getVendor);

// Protected routes
router.use(protect);

// Sub-vendor registration (requires authentication)
router.post('/register/sub-vendor', subVendorValidation, vendorController.registerSubVendor);

// Vendor hierarchy routes
router.get('/:id/hierarchy', param('id').isMongoId().withMessage('Invalid vendor ID'), validateRequest, vendorController.getVendorHierarchy);
router.get('/:id/hierarchy-tree', param('id').isMongoId().withMessage('Invalid vendor ID'), validateRequest, vendorController.getVendorHierarchyTree);
router.get('/:id/children', param('id').isMongoId().withMessage('Invalid vendor ID'), validateRequest, vendorController.getVendorChildren);

// Admin only routes
// router.use(restrictTo('admin'));

router.patch('/:id', vendorValidation, vendorController.updateVendor);
router.delete('/:id', param('id').isMongoId().withMessage('Invalid vendor ID'), validateRequest, vendorController.deleteVendor);
router.patch('/:id/permissions', permissionsValidation, vendorController.updateVendorPermissions);

// Permission management
router.post('/:id/grant-permission', permissionValidation, vendorController.grantPermission);
router.post('/:id/revoke-permission', permissionValidation, vendorController.revokePermission);

module.exports = router; 