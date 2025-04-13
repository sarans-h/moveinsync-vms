const express = require('express');
const router = express.Router();
const { authenticateAdmin } = require('../middleware/auth.middleware');
const Driver = require('../models/driver.model');

// Get all drivers
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const drivers = await Driver.find();
    res.json({ success: true, data: drivers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get driver by ID
router.get('/:id', authenticateAdmin, async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    res.json({ success: true, data: driver });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create driver
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const driver = new Driver(req.body);
    await driver.save();
    res.status(201).json({ success: true, data: driver });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update driver
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    res.json({ success: true, data: driver });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete driver
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const driver = await Driver.findByIdAndDelete(req.params.id);
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    res.json({ success: true, message: 'Driver deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get driver's assigned vehicle
router.get('/:id/vehicle', authenticateAdmin, async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id).populate('assignedVehicle');
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    res.json({ success: true, data: driver.assignedVehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update driver's license information
router.put('/:id/license', authenticateAdmin, async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      { license: req.body },
      { new: true, runValidators: true }
    );
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    res.json({ success: true, data: driver });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update driver's emergency contact
router.put('/:id/emergency-contact', authenticateAdmin, async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      { emergencyContact: req.body },
      { new: true, runValidators: true }
    );
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    res.json({ success: true, data: driver });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router; 