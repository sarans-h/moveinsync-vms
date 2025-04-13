const mongoose = require('mongoose');
const logger = require('../utils/logger');

const assignmentSchema = new mongoose.Schema({
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Vehicle ID is required']
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: [true, 'Driver ID is required']
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
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  deletedAt: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes
assignmentSchema.index({ vehicleId: 1, driverId: 1 }, { unique: true });
assignmentSchema.index({ vendorId: 1 });
assignmentSchema.index({ status: 1 });
assignmentSchema.index({ isActive: 1 });

// Pre-save middleware for logging
assignmentSchema.pre('save', function(next) {
  const vehicleId = this.vehicleId ? this.vehicleId.toString() : 'unknown';
  const driverId = this.driverId ? this.driverId.toString() : 'unknown';
  logger.info(`Saving assignment: Vehicle ${vehicleId} to Driver ${driverId}`);
  next();
});

// Pre-remove middleware for logging
assignmentSchema.pre('remove', function(next) {
  const vehicleId = this.vehicleId ? this.vehicleId.toString() : 'unknown';
  const driverId = this.driverId ? this.driverId.toString() : 'unknown';
  logger.info(`Removing assignment: Vehicle ${vehicleId} to Driver ${driverId}`);
  next();
});

// Static method to find active assignments
assignmentSchema.statics.findActive = function() {
  return this.find({ isActive: true, deletedAt: null });
};

// Static method to find assignments by vendor
assignmentSchema.statics.findByVendor = function(vendorId) {
  return this.find({ vendorId, isActive: true, deletedAt: null });
};

// Static method to find assignments by vehicle
assignmentSchema.statics.findByVehicle = function(vehicleId) {
  return this.find({ vehicleId, isActive: true, deletedAt: null });
};

// Static method to find assignments by driver
assignmentSchema.statics.findByDriver = function(driverId) {
  return this.find({ driverId, isActive: true, deletedAt: null });
};

// Method to soft delete
assignmentSchema.methods.softDelete = async function() {
  this.deletedAt = new Date();
  this.isActive = false;
  this.endDate = new Date();
  return this.save();
};

// Method to end assignment
assignmentSchema.methods.endAssignment = async function() {
  this.isActive = false;
  this.endDate = new Date();
  return this.save();
};

// Method to reactivate assignment
assignmentSchema.methods.reactivateAssignment = async function() {
  this.isActive = true;
  this.endDate = null;
  return this.save();
};

const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment; 