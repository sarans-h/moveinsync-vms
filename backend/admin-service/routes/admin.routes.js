const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/admin.model');
const { authenticateAdmin } = require('../middleware/auth.middleware');
const Vendor = require('../models/vendor.model');
const Driver = require('../models/driver.model');
const Vehicle = require('../models/vehicle.model');

// Admin registration
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    const existingAdmin = await Admin.findOne({ $or: [{ username }, { email }] });
    if (existingAdmin) {
      return res.status(400).json({ success: false, message: 'Username or email already exists' });
    }

    const admin = new Admin({
      username,
      email,
      password
    });

    await admin.save();
    res.status(201).json({ success: true, message: 'Admin created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating admin', error: error.message });
  }
});

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!admin.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    const token = jwt.sign(
      { id: admin._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error logging in', error: error.message });
  }
});

// Get admin profile
router.get('/profile', authenticateAdmin, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password');
    res.json({ success: true, admin });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching profile', error: error.message });
  }
});

// Update admin profile
router.put('/profile', authenticateAdmin, async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findById(req.admin.id);

    if (email) admin.email = email;
    if (password) admin.password = password;

    await admin.save();
    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating profile', error: error.message });
  }
});

// Get all admins
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const admins = await Admin.find().select('-password');
    res.json({ success: true, admins });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching admins', error: error.message });
  }
});

// Deactivate/Activate admin
router.put('/:id/status', authenticateAdmin, async (req, res) => {
  try {
    const { isActive } = req.body;
    const admin = await Admin.findById(req.params.id);

    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    admin.isActive = isActive;
    await admin.save();

    res.json({ success: true, message: `Admin ${isActive ? 'activated' : 'deactivated'} successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating admin status', error: error.message });
  }
});

// Get all entities by identity
router.get('/entities', async (req, res) => {
  try {
    const { identity } = req.query;
    
    if (!identity) {
      return res.status(400).json({
        success: false,
        message: 'Identity query parameter is required'
      });
    }

    // Find vendor by identity
    const finder=identity.split(' ')[0];
    
    const vendor = await Vendor.find({ identity:  { $regex: `^${finder}` } });
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found with the provided identity'
      });
    }

    // Find all drivers for this vendor
    const drivers = await Driver.find({ vendorIdentity:  { $regex: `^${finder}` } });

    // Find all vehicles for this vendor
    const vehicles = await Vehicle.find({ vendorIdentity:  { $regex: `^${finder}` } });

    res.status(200).json({
      success: true,
      data: {
        vendor,
        drivers,
        vehicles
      }
    });
  } catch (error) {
    console.error('Error fetching entities:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router; 