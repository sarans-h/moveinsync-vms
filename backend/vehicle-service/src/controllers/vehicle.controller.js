const Vehicle = require('../models/vehicle.model');
const AppError = require('../utils/appError');
const { logger } = require('../utils/logger');
const ApiResponse = require('../utils/apiResponse');
const catchAsync = require('../utils/catchAsync');

// Onboard a new vehicle
exports.onboardVehicle = catchAsync(async (req, res, next) => {
  const { vehicleNo, ownerInfo } = req.body;
  const vendorId = req.vendor.id;
  const vendorIdentity = req.vendor.identity.split(' ')[0];

  logger.info(`Attempting to onboard vehicle: ${vehicleNo} by vendor: ${vendorId}`);

  // Check if vehicle already exists
  const existingVehicle = await Vehicle.findOne({ vehicleNo });
  if (existingVehicle) {
    logger.warn(`Vehicle onboarding failed: ${vehicleNo} already exists`);
    return next(new AppError('Vehicle number already registered', 400));
  }

  // Create new vehicle
  const vehicle = await Vehicle.create({
    vehicleNo,
    ownerInfo,
    vendorId,
    vendorIdentity

  });

  logger.info(`Vehicle onboarded successfully: ${vehicleNo}`);

  res.status(201).json(
    ApiResponse.success(
      { vehicle },
      'Vehicle onboarded successfully'
    )
  );
});

// Get all vehicles for a vendor
exports.getVendorVehicles = catchAsync(async (req, res, next) => {

  const vendorId = req.vendor.id;
  const vendorIdentity = req.vendor.identity.split(' ')[0];
  // const { page = 1, limit = 10, status, search } = req.query;

  logger.info(`Fetching vehicles for vendor: ${vendorId}`);

  const query = { vendorIdentity, deletedAt: null };
  
  
  

  const vehicles = await Vehicle.find(query)
    // .populate('driverAssigned', 'name phoneNo');

  // const total = await Vehicle.countDocuments(query);

  // logger.info(`Found ${vehicles.length} vehicles for vendor: ${vendorId}`);

  res.json(
    ApiResponse.success(
      {
        vehicles
      },
      'Vehicles retrieved successfully'
    )
  );
});

// Get a single vehicle
exports.getVehicle = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const vendorId = req.user.vendorId;

  logger.info(`Fetching vehicle: ${id} for vendor: ${vendorId}`);

  const vehicle = await Vehicle.findOne({ _id: id, vendorId, deletedAt: null })
    .populate('driverAssigned', 'name phoneNo');

  if (!vehicle) {
    logger.warn(`Vehicle not found: ${id}`);
    return next(new AppError('Vehicle not found', 404));
  }

  logger.info(`Vehicle retrieved successfully: ${id}`);

  res.json(
    ApiResponse.success(
      { vehicle },
      'Vehicle retrieved successfully'
    )
  );
});

// Update vehicle
exports.updateVehicle = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const vendorId = req.user.vendorId;
  const { vehicleNo, ownerInfo, status } = req.body;

  logger.info(`Updating vehicle: ${id} for vendor: ${vendorId}`);

  const vehicle = await Vehicle.findOne({ _id: id, vendorId, deletedAt: null });

  if (!vehicle) {
    logger.warn(`Vehicle not found for update: ${id}`);
    return next(new AppError('Vehicle not found', 404));
  }

  // Check if new vehicle number already exists
  if (vehicleNo && vehicleNo !== vehicle.vehicleNo) {
    const existingVehicle = await Vehicle.findOne({ vehicleNo });
    if (existingVehicle) {
      logger.warn(`Vehicle update failed: ${vehicleNo} already exists`);
      return next(new AppError('Vehicle number already registered', 400));
    }
  }

  // Update vehicle
  Object.assign(vehicle, { vehicleNo, ownerInfo, status });
  await vehicle.save();

  logger.info(`Vehicle updated successfully: ${id}`);

  res.json(
    ApiResponse.success(
      { vehicle },
      'Vehicle updated successfully'
    )
  );
});

// Delete vehicle (soft delete)
exports.deleteVehicle = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const vendorId = req.user.vendorId;

  logger.info(`Deleting vehicle: ${id} for vendor: ${vendorId}`);

  const vehicle = await Vehicle.findOne({ _id: id, vendorId, deletedAt: null });

  if (!vehicle) {
    logger.warn(`Vehicle not found for deletion: ${id}`);
    return next(new AppError('Vehicle not found', 404));
  }

  // Check if vehicle has assigned driver
  if (vehicle.driverAssigned) {
    logger.warn(`Cannot delete vehicle with assigned driver: ${id}`);
    return next(new AppError('Cannot delete vehicle with assigned driver', 400));
  }

  await vehicle.softDelete();

  logger.info(`Vehicle deleted successfully: ${id}`);

  res.json(
    ApiResponse.success(
      null,
      'Vehicle deleted successfully'
    )
  );
});

// Assign driver to vehicle
exports.assignDriver = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { driverId } = req.body;
  const vendorId = req.user.vendorId;

  logger.info(`Assigning driver ${driverId} to vehicle: ${id}`);

  const vehicle = await Vehicle.findOne({ _id: id, vendorId, deletedAt: null });

  if (!vehicle) {
    logger.warn(`Vehicle not found for driver assignment: ${id}`);
    return next(new AppError('Vehicle not found', 404));
  }

  // Check if vehicle already has a driver
  if (vehicle.driverAssigned) {
    logger.warn(`Vehicle already has assigned driver: ${id}`);
    return next(new AppError('Vehicle already has an assigned driver', 400));
  }

  await vehicle.assignDriver(driverId);

  logger.info(`Driver assigned successfully to vehicle: ${id}`);

  res.json(
    ApiResponse.success(
      { vehicle },
      'Driver assigned successfully'
    )
  );
});

// Unassign driver from vehicle
exports.unassignDriver = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const vendorId = req.user.vendorId;

  logger.info(`Unassigning driver from vehicle: ${id}`);

  const vehicle = await Vehicle.findOne({ _id: id, vendorId, deletedAt: null });

  if (!vehicle) {
    logger.warn(`Vehicle not found for driver unassignment: ${id}`);
    return next(new AppError('Vehicle not found', 404));
  }

  // Check if vehicle has a driver
  if (!vehicle.driverAssigned) {
    logger.warn(`Vehicle has no assigned driver: ${id}`);
    return next(new AppError('Vehicle has no assigned driver', 400));
  }

  await vehicle.unassignDriver();

  logger.info(`Driver unassigned successfully from vehicle: ${id}`);

  res.json(
    ApiResponse.success(
      { vehicle },
      'Driver unassigned successfully'
    )
  );
}); 