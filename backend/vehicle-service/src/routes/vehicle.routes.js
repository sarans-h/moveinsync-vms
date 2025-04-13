const express = require('express');
const { body, query, param } = require('express-validator');
const { validateRequest } = require('../middleware/validateRequest');
const { protect, restrictTo } = require('../middleware/auth');
const vehicleController = require('../controllers/vehicle.controller');

const router = express.Router();

// Validation middleware
const vehicleValidation = [
  body('vehicleNo')
    .trim()
    .notEmpty()
    .withMessage('Vehicle number is required')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Vehicle number must contain only uppercase letters and numbers'),
  body('ownerInfo.name')
    .trim()
    .notEmpty()
    .withMessage('Owner name is required'),
  body('ownerInfo.phoneNo')
    .trim()
    .notEmpty()
    .withMessage('Owner phone number is required')
    .matches(/^\+?[\d\s-]+$/)
    .withMessage('Please provide a valid phone number'),
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
  validateRequest
];

const driverAssignmentValidation = [
  body('driverId')
    .isMongoId()
    .withMessage('Invalid driver ID'),
  validateRequest
];

// All routes require authentication
router.use(protect);

// All routes require vehicleOnboarding permission

// Vehicle routes
router.post('/', vehicleValidation, vehicleController.onboardVehicle);
router.get('/', vehicleController.getVendorVehicles);
router.get('/:id', param('id').isMongoId().withMessage('Invalid vehicle ID'), validateRequest, vehicleController.getVehicle);
router.patch('/:id', vehicleValidation, vehicleController.updateVehicle);
router.delete('/:id', param('id').isMongoId().withMessage('Invalid vehicle ID'), validateRequest, vehicleController.deleteVehicle);

// Driver assignment routes
router.post('/:id/assign-driver', driverAssignmentValidation, vehicleController.assignDriver);
router.post('/:id/unassign-driver', vehicleController.unassignDriver);

module.exports = router; 