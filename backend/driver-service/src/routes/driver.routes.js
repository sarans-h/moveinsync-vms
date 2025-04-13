const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driver.controller');
const vendorAuth = require('../middleware/vendorAuth');

// Apply vendor authentication middleware to all routes
router.use(vendorAuth);

// Driver routes
router.post('/', driverController.createDriver);
router.get('/', driverController.getDrivers);
router.get('/:id', driverController.getDriverById);
router.get('/user/:userId', driverController.getDriverByUserId);
router.put('/:id', driverController.updateDriver);
router.delete('/:id', driverController.deleteDriver);

module.exports = router; 