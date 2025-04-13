const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  vehicleNo: {
    type: String,
    required: [true, 'Vehicle number is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  ownerInfo: {
    name: {
      type: String,
      required: [true, 'Owner name is required'],
      trim: true
    },
    phoneNo: {
      type: String,
      required: [true, 'Owner phone number is required'],
      trim: true,
      match: [/^\+?[\d\s-]+$/, 'Please provide a valid phone number']
    }
  },
  driverAssigned: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    default: null
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: [true, 'Vendor ID is required']
  },
  vendorIdentity: {
    type: String,
    required: [true, 'Vendor identity is required']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes
vehicleSchema.index({ vehicleNo: 1 }, { unique: true });
vehicleSchema.index({ vendorId: 1 });
vehicleSchema.index({ driverAssigned: 1 });
vehicleSchema.index({ status: 1 });

// Pre-save middleware for logging
vehicleSchema.pre('save', function(next) {
  // logger.info(`Saving vehicle: ${this.vehicleNo}`);
  next();
});

// Pre-remove middleware for logging
vehicleSchema.pre('remove', function(next) {
  // logger.info(`Removing vehicle: ${this.vehicleNo}`);
  next();
});

// Static method to find active vehicles
vehicleSchema.statics.findActive = function() {
  return this.find({ isActive: true, deletedAt: null });
};

// Static method to find vehicles by vendor
vehicleSchema.statics.findByVendor = function(vendorId) {
  return this.find({ vendorId, isActive: true, deletedAt: null });
};

// Static method to find vehicles by driver
vehicleSchema.statics.findByDriver = function(driverId) {
  return this.find({ driverAssigned: driverId, isActive: true, deletedAt: null });
};

// Method to soft delete
vehicleSchema.methods.softDelete = async function() {
  this.deletedAt = new Date();
  this.isActive = false;
  return this.save();
};

// Method to assign driver
vehicleSchema.methods.assignDriver = async function(driverId) {
  this.driverAssigned = driverId;
  return this.save();
};

// Method to unassign driver
vehicleSchema.methods.unassignDriver = async function() {
  this.driverAssigned = null;
  return this.save();
};

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicle; 