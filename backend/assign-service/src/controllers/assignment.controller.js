const Assignment = require('../models/assignment.model');
const logger = require('../utils/logger');
const ApiResponse = require('../utils/apiResponse');
const axios = require('axios');
const AppError = require('../utils/AppError');
const Driver = require('../models/driver.model');
const Vehicle = require('../models/vehicle.model');


// Create a new assignment
exports.createAssignment = async (req, res, next) => {
  try {
    logger.info('=== Starting createAssignment function ===');
    logger.info(JSON.stringify(req.body));
    // Check if req.vendor exists before logging it
    if (req.vendor) {
      logger.info('req.vendor:', req.vendor);
      // logger.info('Vendor ID:', req.vendor.id);
    } else {
      logger.warn('req.vendor is undefined');
    }

    //check whewtherr the driver and vehicle valid and belong to same vendor
    const driver = await Driver.findById(req.body.driverId);
    const vehicle = await Vehicle.findById(req.body.vehicleId);
    if(!driver || !vehicle){
      return next(new AppError('Driver or vehicle not found', 404));
    }
    if(driver.vendorIdentity !== vehicle.vendorIdentity){
      return next(new AppError('Driver and vehicle do not belong to the same vendor', 400));
    }
    if(driver.vendorIdentity !== req.vendor.identity.split(' ')[0]){
      return next(new AppError('Driver does not belong to the same vendor', 400));
    }
    if(vehicle.vendorIdentity !== req.vendor.identity.split(' ')[0]){
      return next(new AppError('Vehicle does not belong to the same vendor', 400));
    }
    const assignment = await Assignment.create({
      driverId: req.body.driverId,
      vehicleId: req.body.vehicleId,
      vendorId: req.vendor.id,
      vendorIdentity: req.vendor.identity.split(' ')[0],
      status: 'active'
    });
    await assignment.save();
    vehicle.driverAssigned = req.body.driverId;
    await vehicle.save();
    driver.vehicleAssigned = req.body.vehicleId;
    await driver.save();
    logger.info('Assignment created successfully');
    // logger.info('Assignment created successfully');
    // logger.info(JSON.stringify(assignment));
    res.status(200).json({
      success: true,
      message: 'Assignment created successfully',
      assignment
    });
   
  } catch (error) {
    // Use logger for error handling
    logger.error('Error in createAssignment:', error);
    return next(new AppError('An unexpected error occurred', 500));
  }
};

// Get all assignments for a vendor
exports.getVendorAssignments = (async (req, res, next) => {
  const vendorId = req.vendor.id;
  const { page = 1, limit = 10, status, search } = req.query;

  logger.info(`Fetching assignments for vendor: ${vendorId}`);

  const query = { vendorId, deletedAt: null };
  
  if (status) {
    query.status = status;
  }

  if (search) {
    query.$or = [
      { vehicleId: { $regex: search, $options: 'i' } },
      { driverId: { $regex: search, $options: 'i' } }
    ];
  }

  const assignments = await Assignment.find(query)
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .populate('vehicleId', 'vehicleNo ownerInfo')
    .populate('driverId', 'name phoneNo');

  const total = await Assignment.countDocuments(query);

  logger.info(`Found ${assignments.length} assignments for vendor: ${vendorId}`);

  res.json(
    ApiResponse.success(
      {
        assignments,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      },
      'Assignments retrieved successfully'
    )
  );
});

// Get a single assignment
exports.getAssignment = (async (req, res, next) => {
  const { id } = req.params;
  const vendorId = req.vendor.id;

  logger.info(`Fetching assignment: ${id} for vendor: ${vendorId}`);

  const assignment = await Assignment.findOne({ _id: id, vendorId, deletedAt: null })
    .populate('vehicleId', 'vehicleNo ownerInfo')
    .populate('driverId', 'name phoneNo');

  if (!assignment) {
    logger.warn(`Assignment not found: ${id}`);
    return next(new AppError('Assignment not found', 404));
  }

  logger.info(`Assignment retrieved successfully: ${id}`);

  res.json(
    ApiResponse.success(
      { assignment },
      'Assignment retrieved successfully'
    )
  );
});

// End an assignment
exports.endAssignment = (async (req, res, next) => {
  const { id } = req.params;
  const vendorId = req.vendor.id;

  logger.info(`Ending assignment: ${id} for vendor: ${vendorId}`);

  const assignment = await Assignment.findOne({ _id: id, vendorId, deletedAt: null });

  if (!assignment) {
    logger.warn(`Assignment not found for ending: ${id}`);
    return next(new AppError('Assignment not found', 404));
  }

  if (!assignment.isActive) {
    logger.warn(`Assignment already ended: ${id}`);
    return next(new AppError('Assignment already ended', 400));
  }

  // End the assignment
  await assignment.endAssignment();

  // Update vehicle to unassign driver
  try {
    await axios.post(
      `${process.env.VEHICLE_SERVICE_URL}/api/vehicles/${assignment.vehicleId}/unassign-driver`,
      {},
      {
        headers: {
          Authorization: `Bearer ${req.cookies.jwt}`
        }
      }
    );
  } catch (error) {
    logger.error(`Error updating vehicle: ${error.message}`);
    // Continue even if vehicle update fails, but log the error
  }

  logger.info(`Assignment ended successfully: ${id}`);

  res.json(
    ApiResponse.success(
      { assignment },
      'Assignment ended successfully'
    )
  );
});

// Reactivate an assignment
exports.reactivateAssignment = (async (req, res, next) => {
  const { id } = req.params;
  const vendorId = req.vendor.id;

  logger.info(`Reactivating assignment: ${id} for vendor: ${vendorId}`);

  const assignment = await Assignment.findOne({ _id: id, vendorId, deletedAt: null });

  if (!assignment) {
    logger.warn(`Assignment not found for reactivation: ${id}`);
    return next(new AppError('Assignment not found', 404));
  }

  if (assignment.isActive) {
    logger.warn(`Assignment already active: ${id}`);
    return next(new AppError('Assignment already active', 400));
  }

  // Check if vehicle already has an active driver
  try {
    const vehicleResponse = await axios.get(
      `${process.env.VEHICLE_SERVICE_URL}/api/vehicles/${assignment.vehicleId}`,
      {
        headers: {
          Authorization: `Bearer ${req.cookies.jwt}`
        }
      }
    );

    const vehicle = vehicleResponse.data.data.vehicle;
    
    if (vehicle.driverAssigned && vehicle.driverAssigned.toString() !== assignment.driverId.toString()) {
      logger.warn(`Vehicle ${assignment.vehicleId} already has an assigned driver`);
      return next(new AppError('Vehicle already has an assigned driver', 400));
    }
  } catch (error) {
    logger.error(`Error verifying vehicle: ${error.message}`);
    return next(new AppError('Error verifying vehicle', 500));
  }

  // Reactivate the assignment
  await assignment.reactivateAssignment();

  // Update vehicle to assign driver
  try {
    await axios.post(
      `${process.env.VEHICLE_SERVICE_URL}/api/vehicles/${assignment.vehicleId}/assign-driver`,
      { driverId: assignment.driverId },
      {
        headers: {
          Authorization: `Bearer ${req.cookies.jwt}`
        }
      }
    );
  } catch (error) {
    logger.error(`Error updating vehicle: ${error.message}`);
    // Continue even if vehicle update fails, but log the error
  }

  logger.info(`Assignment reactivated successfully: ${id}`);

  res.json(
    ApiResponse.success(
      { assignment },
      'Assignment reactivated successfully'
    )
  );
});

// Delete assignment (soft delete)
exports.deleteAssignment = (async (req, res, next) => {
  const { id } = req.params;
  const vendorId = req.vendor.id;

  logger.info(`Deleting assignment: ${id} for vendor: ${vendorId}`);

  const assignment = await Assignment.findOne({ _id: id, vendorId, deletedAt: null });

  if (!assignment) {
    logger.warn(`Assignment not found for deletion: ${id}`);
    return next(new AppError('Assignment not found', 404));
  }

  // Soft delete the assignment
  await assignment.softDelete();

  // If assignment was active, unassign driver from vehicle
  if (assignment.isActive) {
    try {
      await axios.post(
        `${process.env.VEHICLE_SERVICE_URL}/api/vehicles/${assignment.vehicleId}/unassign-driver`,
        {},
        {
          headers: {
            Authorization: `Bearer ${req.cookies.jwt}`
          }
        }
      );
    } catch (error) {
      logger.error(`Error updating vehicle: ${error.message}`);
      // Continue even if vehicle update fails, but log the error
    }
  }

  logger.info(`Assignment deleted successfully: ${id}`);

  res.json(
    ApiResponse.success(
      null,
      'Assignment deleted successfully'
    )
  );
}); 