const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const vendorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Vendor name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false // Don't return password in queries by default
    },
    vendorLevel: {
      type: String,
      enum: ['national', 'regional', 'state', 'city', 'local'],
      required: [true, 'Vendor level is required']
    },
    hierarchyLevel: {
      type: Number,
      required: [true, 'Hierarchy level is required'],
      min: 1,
      max: 5
    },
    identity: {
      type: String,
      required: [true, 'Vendor identity is required'],
      unique: true,
      trim: true
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: function() {
        return this.vendorLevel !== 'national';
      }
    },
    location: {
      address: {
        type: String,
        required: [true, 'Address is required']
      },
      city: {
        type: String,
        required: [true, 'City is required']
      },
      state: {
        type: String,
        required: [true, 'State is required']
      },
      country: {
        type: String,
        required: [true, 'Country is required']
      }
    },
    contact: {
      phone: {
        type: String,
        required: [true, 'Phone number is required'],
        match: [/^\+?[\d\s-]+$/, 'Please enter a valid phone number']
      },
      alternatePhone: {
        type: String,
        match: [/^\+?[\d\s-]+$/, 'Please enter a valid phone number']
      }
    },
    isActive: {
      type: Boolean,
      default: true
    },
    deletedAt: {
      type: Date,
      default: null
    },
    permissions: {
      createVendors: {
        type: Boolean,
        default: false
      },
      processPayments: {
        type: Boolean,
        default: false
      },
      vehicleOnboarding: {
        type: Boolean,
        default: false
      },
      driverOnboarding: {
        type: Boolean,
        default: false
      },
      assignVehicle:{
        type: Boolean,
        default: false
      }
    },
    grantedPermissions: [{
      type: String,
      enum: ['createVendors', 'processPayments', 'vehicleOnboarding', 'driverOnboarding', 'assignVehicle']
    }],
    apiKey: {
      type: String,
      unique: true,
      sparse: true
    },
    apiKeyExpires: Date,
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    lastLogin: Date
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for children vendors
vendorSchema.virtual('children', {
  ref: 'Vendor',
  localField: '_id',
  foreignField: 'parentId'
});

// Custom toJSON method to ensure proper serialization
vendorSchema.methods.toJSON = function() {
  const obj = this.toObject();
  
  // Remove sensitive fields
  if (obj.password) {
    delete obj.password;
  }
  
  // Ensure _id is included
  if (obj._id) {
    obj.id = obj._id.toString();
  }
  
  return obj;
};

// Indexes
vendorSchema.index({ email: 1 });
vendorSchema.index({ identity: 1 });
vendorSchema.index({ parentId: 1 });
vendorSchema.index({ vendorLevel: 1 });
vendorSchema.index({ hierarchyLevel: 1 });
vendorSchema.index({ deletedAt: 1 });

// Pre-save middleware to set hierarchy level based on vendor level
vendorSchema.pre('save', function(next) {
  const levelMap = {
    'national': 1,
    'regional': 2,
    'state': 3,
    'city': 4,
    'local': 5
  };
  this.hierarchyLevel = levelMap[this.vendorLevel];
  next();
});

// Pre-save middleware to hash password
vendorSchema.pre('save', async function(next) {
  // Only hash the password if it's modified or new
  if (!this.isModified('password')) return next();

  try {
    // Generate salt
    const salt = await bcrypt.genSalt(10);
    // Hash password
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check if vendor has specific permission
vendorSchema.methods.hasPermission = function(permission) {
  return this.permissions[permission] === true;
};

// Method to grant permission to child vendor
vendorSchema.methods.grantPermission = async function(childId, permission) {
  // Check if parent has the permission
  if (!this.hasPermission(permission)) {
    throw new Error('Parent vendor does not have this permission to grant');
  }

  const child = await this.model('Vendor').findById(childId);
  if (!child) {
    throw new Error('Child vendor not found');
  }

  // Check if child is actually a child of this vendor
  if (child.parentId.toString() !== this._id.toString()) {
    throw new Error('Not authorized to grant permissions to this vendor');
  }

  // Grant permission
  child.permissions[permission] = true;
  if (!child.grantedPermissions.includes(permission)) {
    child.grantedPermissions.push(permission);
  }
  await child.save();

  // Recursively grant to all children if this is a createVendors permission
  // if (permission === 'createVendors') {
  //   const children = await this.model('Vendor').find({ parentId: childId });
  //   for (const grandChild of children) {
  //     await this.grantPermission(grandChild._id, permission);
  //   }
  // }
};

// Method to revoke permission from child vendor
vendorSchema.methods.revokePermission = async function(childId, permission) {
  // Base case: If childId is null or undefined, return
  if (!childId) {
    return;
  }

  const child = await this.model('Vendor').findById(childId);
  if (!child) {
    throw new Error('Child vendor not found');
  }

  // Check if child is actually a child of this vendor
  if (child.parentId.toString() !== this._id.toString()) {
    console.log('Permission revocation error:');
    console.log('Child parentId:', child.parentId ? child.parentId.toString() : 'null');
    console.log('This _id:', this._id.toString());
    throw new Error('Not authorized to revoke permissions from this vendor');
  }

  // Revoke permission
  child.permissions[permission] = false;
  child.grantedPermissions = child.grantedPermissions.filter(p => p !== permission);
  await child.save();

  // Find all direct children of this child
  const children = await this.model('Vendor').find({ parentId: childId });
  
  // Recursively revoke from all children
  for (const grandChild of children) {
    // Use the child's revokePermission method to revoke from grandchildren
    await child.revokePermission(grandChild._id, permission);
  }
};

// Method to get vendor hierarchy path
vendorSchema.methods.getHierarchyPath = async function() {
  console.log(`Getting hierarchy path for vendor: ${this.name} (${this._id})`);
  const path = [this];
  let current = this;
  let level = 1;
  
  while (current.parentId) {
    console.log(`Level ${level}: Finding parent with ID: ${current.parentId}`);
    current = await this.model('Vendor').findById(current.parentId);
    if (current) {
      console.log(`Level ${level}: Found parent: ${current.name} (${current._id})`);
      path.unshift(current);
      level++;
    } else {
      console.log(`Level ${level}: Parent not found for ID: ${current.parentId}`);
      break;
    }
  }
  
  console.log(`Complete hierarchy path: ${path.length} vendors`);
  path.forEach((vendor, index) => {
    console.log(`${index + 1}. ${vendor.name} (${vendor._id}) - Level: ${vendor.vendorLevel}`);
  });
  
  return path;
};

// Method to get complete vendor hierarchy tree
vendorSchema.methods.getHierarchyTree = async function() {
  console.log(`Getting hierarchy tree for vendor: ${this.name} (${this._id})`);
  
  // Create a simplified vendor object with just the essential fields
  const vendorObj = {
    id: this._id,
    name: this.name,
    level: this.vendorLevel,
    identity: this.identity,
    permissions: this.permissions, 
    children: []
  };
  
  // Find all direct children of this vendor
  const children = await this.model('Vendor').find({ parentId: this._id, deletedAt: null });
  
  // Recursively get the hierarchy tree for each child
  for (const child of children) {
    const childTree = await child.getHierarchyTree();
    vendorObj.children.push(childTree);
  }
  
  return vendorObj;
};

// Static method to generate vendor identity
vendorSchema.statics.generateVendorIdentity = async function(baseName, vendorLevel, parentId) {
  // For national level, just return the base name
  if (vendorLevel === 'national') {
    return baseName;
  }

  // For other levels, find the last sequence number for this parent
  const lastVendor = await this.findOne({ parentId })
    .sort({ identity: -1 });

  let sequenceNumber = 1;
  if (lastVendor) {
    // Extract the sequence number from the last vendor's identity
    const match = lastVendor.identity.match(/\d+$/);
    if (match) {
      sequenceNumber = parseInt(match[0]) + 1;
    }
  }

  // Generate the new identity based on level
  const levelPrefix = {
    'regional': 'South',
    'state': 'State',
    'city': 'City',
    'local': 'Local'
  }[vendorLevel];

  return `${baseName} ${levelPrefix} ${sequenceNumber}`;
};

// Method to compare password
vendorSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error(error);
  }
};

// Method to check if vendor has a specific permission
vendorSchema.methods.hasPermissions = function(permission) {
  return this.permissions[permission] === true;
};

const Vendor = mongoose.model('Vendor', vendorSchema);

module.exports = Vendor; 