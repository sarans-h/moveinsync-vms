const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignment.controller');
const { protect, restrictTo } = require('../middleware/auth');
const { validateAssignment } = require('../middleware/validation');

// All routes require authentication
router.use(protect);

// Create new assignment
router.post(
  '/',
  validateAssignment,
  assignmentController.createAssignment
);

// Get all assignments for vendor
router.get(
  '/',
  restrictTo('vendor'),
  assignmentController.getVendorAssignments
);

// Get single assignment
router.get(
  '/:id',
  restrictTo('vendor'),
  assignmentController.getAssignment
);

// End assignment
router.post(
  '/:id/end',
  restrictTo('vendor'),
  assignmentController.endAssignment
);

// Reactivate assignment
router.post(
  '/:id/reactivate',
  restrictTo('vendor'),
  assignmentController.reactivateAssignment
);

// Delete assignment
router.delete(
  '/:id',
  restrictTo('vendor'),
  assignmentController.deleteAssignment
);

module.exports = router; 