const jwt = require('jsonwebtoken');
const Admin = require('../models/admin.model');

const authenticateAdmin = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required. Please login.' 
      });
    }

    const token = authHeader.split(' ')[1];

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find admin
      const admin = await Admin.findById(decoded.id);
      
      if (!admin) {
        return res.status(401).json({ 
          success: false, 
          message: 'Admin not found' 
        });
      }

      if (!admin.isActive) {
        return res.status(403).json({ 
          success: false, 
          message: 'Admin account is deactivated' 
        });
      }

      // Attach admin to request
      req.admin = admin;
      next();
    } catch (error) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error during authentication' 
    });
  }
};

module.exports = {
  authenticateAdmin
}; 