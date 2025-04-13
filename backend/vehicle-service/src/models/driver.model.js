const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
  },
  firstName: {
    type: String,
    required: true
  },
  vehicleAssigned: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    default: null
  },
  lastName: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  vendorIdentity: {
    type: String,
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true
  },
  licenseState: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phoneNumber: String
  }
}, { timestamps: true });

const Driver = mongoose.model('Driver', driverSchema);

module.exports = Driver; 