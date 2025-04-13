const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const adminRoutes = require('./routes/admin.routes');
const vendorRoutes = require('./routes/vendor.routes');
const driverRoutes = require('./routes/driver.routes');
const vehicleRoutes = require('./routes/vehicle.routes');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
//   origin: process.env.FRONTEND_URL,
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/admin/vendors', vendorRoutes);
app.use('/api/admin/drivers', driverRoutes);
app.use('/api/admin/vehicles', vehicleRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3006;
app.listen(PORT, () => {
  console.log(`Admin service running on port ${PORT}`);
}); 