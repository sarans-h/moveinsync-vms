const Driver = require('../models/driver.model');
const logger = require('../utils/logger');

/**
 * Create a new driver
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createDriver = async (req, res) => {
  try {
    const driverData = {
      ...req.body,
      vendorId: req.vendor.id, // Add the vendor ID from the authenticated vendor
      vendorIdentity: req.vendor.identity.split(' ')[0]
    };
    
    // Check if driver with the same userId already exists
    const existingDriver = await Driver.findOne({ licenseNumber: driverData.licenseNumber });
    if (existingDriver) {
      return res.status(400).json({
        success: false,
        message: 'Driver with this license ID already exists'
      });
    }
    
    // Create new driver
    const driver = new Driver(driverData);
    await driver.save();
    
    logger.info(`Driver created: ${driver._id} by vendor: ${req.vendor.id}`);
    res.status(201).json(driver);
  } catch (error) {
    logger.error('Error creating driver:', error);
    res.status(500).json({ message: 'Error creating driver', error: error.message });
  }
};

exports.getDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find({ vendorIdentity: req.vendor.identity.split(' ')[0] });
    res.json({ drivers });
  } catch (error) {
    logger.error('Error getting drivers:', error);
    res.status(500).json({ message: 'Error getting drivers', error: error.message });
  }
};
/**
 * Get a driver by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getDriverById = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      logger.warn(`Driver not found with ID: ${req.params.id}`);
      return res.status(404).json({ message: 'Driver not found' });
    }
    logger.info(`Driver retrieved: ${driver._id}`);
    res.json(driver);
  } catch (error) {
    logger.error('Error getting driver:', error);
    res.status(500).json({ message: 'Error getting driver', error: error.message });
  }
};

/**
 * Get a driver by user ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getDriverByUserId = async (req, res) => {
  try {
    const driver = await Driver.findOne({ userId: req.params.userId });
    if (!driver) {
      logger.warn(`Driver not found with user ID: ${req.params.userId}`);
      return res.status(404).json({ message: 'Driver not found' });
    }
    logger.info(`Driver retrieved by user ID: ${req.params.userId}`);
    res.json(driver);
  } catch (error) {
    logger.error('Error getting driver by user ID:', error);
    res.status(500).json({ message: 'Error getting driver', error: error.message });
  }
};

/**
 * Update a driver
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateDriver = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      logger.warn(`Driver not found with ID: ${req.params.id}`);
      return res.status(404).json({ message: 'Driver not found' });
    }

    // Check if the authenticated vendor owns this driver
    if (driver.vendorId.toString() !== req.vendor.id) {
      logger.warn(`Unauthorized update attempt on driver: ${req.params.id} by vendor: ${req.vendor.id}`);
      return res.status(403).json({ message: 'Not authorized to update this driver' });
    }

    Object.assign(driver, req.body);
    await driver.save();

    logger.info(`Driver updated: ${driver._id} by vendor: ${req.vendor.id}`);
    res.json(driver);
  } catch (error) {
    logger.error('Error updating driver:', error);
    res.status(500).json({ message: 'Error updating driver', error: error.message });
  }
};

/**
 * Delete a driver
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteDriver = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      logger.warn(`Driver not found with ID: ${req.params.id}`);
      return res.status(404).json({ message: 'Driver not found' });
    }

    // Check if the authenticated vendor owns this driver
    if (driver.vendorId.toString() !== req.vendor.id) {
      logger.warn(`Unauthorized delete attempt on driver: ${req.params.id} by vendor: ${req.vendor.id}`);
      return res.status(403).json({ message: 'Not authorized to delete this driver' });
    }

    await driver.remove();
    logger.info(`Driver deleted: ${req.params.id} by vendor: ${req.vendor.id}`);
    res.json({ message: 'Driver deleted successfully' });
  } catch (error) {
    logger.error('Error deleting driver:', error);
    res.status(500).json({ message: 'Error deleting driver', error: error.message });
  }
};

/**
 * Upload a license document for a driver
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.uploadLicenseDocument = async (req, res) => {
  try {
    const driverId = req.params.id;
    const { issueDate, expiryDate } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    const driver = await Driver.findById(driverId);
    
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }
    
    // Add license document to driver
    driver.licenseDocuments.push({
      fileUrl: req.file.path,
      fileName: req.file.filename,
      issueDate: new Date(issueDate),
      expiryDate: new Date(expiryDate)
    });
    
    await driver.save();
    
    // Check if document is expiring soon and send notification if needed
    const daysThreshold = parseInt(process.env.DOCUMENT_EXPIRY_NOTIFICATION_DAYS) || 30;
    const expiringDocuments = driver.getExpiringLicenseDocuments(daysThreshold);
    
    if (expiringDocuments.length > 0) {
      await sendExpiryNotification(driver, expiringDocuments);
    }
    
    res.status(200).json({
      success: true,
      data: driver
    });
  } catch (error) {
    console.error('Error uploading license document:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading license document',
      error: error.message
    });
  }
};

/**
 * Get all license documents for a driver
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getLicenseDocuments = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: driver.licenseDocuments
    });
  } catch (error) {
    console.error('Error getting license documents:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting license documents',
      error: error.message
    });
  }
};

/**
 * Delete a license document
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteLicenseDocument = async (req, res) => {
  try {
    const { driverId, documentId } = req.params;
    
    const driver = await Driver.findById(driverId);
    
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }
    
    // Find the document
    const document = driver.licenseDocuments.id(documentId);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'License document not found'
      });
    }
    
    // Remove the document
    document.remove();
    
    await driver.save();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting license document:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting license document',
      error: error.message
    });
  }
}; 