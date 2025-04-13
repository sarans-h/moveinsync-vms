const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

const validateAssignment = (req, res, next) => {
  try {
    const { vehicleId, driverId, notes } = req.body;
    // logger.info(`Validation assignment: Vehicle ${vehicleId} to Driver ${driverId}`);
    
    // Check required fields
    if (!vehicleId || !driverId) {
      return next(new AppError('Missing required fields: vehicleId and driverId are required', 400));
    }

    // Validate IDs format
    if (!/^[0-9a-fA-F]{24}$/.test(vehicleId)) {
      return next(new AppError('Invalid vehicle ID format', 400));
    }

    if (!/^[0-9a-fA-F]{24}$/.test(driverId)) {
      return next(new AppError('Invalid driver ID format', 400));
    }
    //logger.info(`Validation completed`);

    next();
  } catch (error) {
    // Safely log the error without accessing potentially undefined properties
    //logger.error('Assignment validation error');
    if (error && typeof error === 'object') {
      if (error.message) {
        logger.error('Error message:', error.message);
      }
      if (error.stack) {
        logger.error('Error stack:', error.stack);
      }
    } else {
      logger.error('Error details:', error);
    }
    next(new AppError('Validation error', 400));
  }
};

module.exports = {
  validateAssignment
}; 