const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Information
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  
  // Profile Information
  avatar: {
    type: String,
    default: null
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  nationality: {
    type: String,
    required: true
  },
  passportNumber: {
    type: String,
    required: true,
    unique: true
  },
  
  // Blockchain Identity
  blockchainWallet: {
    address: {
      type: String,
      unique: true,
      sparse: true
    },
    privateKey: {
      type: String,
      select: false // Never return in queries
    },
    identityHash: {
      type: String,
      unique: true,
      sparse: true
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationDate: {
      type: Date,
      default: null
    }
  },
  
  // Safety Profile
  safetyScore: {
    type: Number,
    default: 85,
    min: 0,
    max: 100
  },
  riskProfile: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  
  // Location Tracking
  currentLocation: {
    latitude: Number,
    longitude: Number,
    accuracy: Number,
    timestamp: Date,
    address: String
  },
  locationHistory: [{
    latitude: Number,
    longitude: Number,
    timestamp: Date,
    address: String,
    safetyStatus: {
      type: String,
      enum: ['safe', 'caution', 'danger'],
      default: 'safe'
    }
  }],
  
  // Emergency Contacts
  emergencyContacts: [{
    name: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    relationship: {
      type: String,
      required: true
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  
  // Travel Information
  currentTrip: {
    destination: String,
    startDate: Date,
    endDate: Date,
    companions: [String],
    itinerary: [{
      place: String,
      plannedTime: Date,
      coordinates: {
        latitude: Number,
        longitude: Number
      },
      completed: {
        type: Boolean,
        default: false
      }
    }]
  },
  
  // Activity Tracking
  lastActivity: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  inactiveAlertSent: {
    type: Boolean,
    default: false
  },
  
  // Settings
  preferences: {
    notifications: {
      sms: {
        type: Boolean,
        default: true
      },
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    },
    privacy: {
      shareLocation: {
        type: Boolean,
        default: true
      },
      shareWithContacts: {
        type: Boolean,
        default: true
      }
    },
    safety: {
      geoFencing: {
        type: Boolean,
        default: true
      },
      autoSOS: {
        type: Boolean,
        default: false
      },
      sosTimeout: {
        type: Number,
        default: 10 // seconds
      }
    },
  },
  
  // System fields
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  
  // Device Information
  deviceInfo: {
    platform: String,
    version: String,
    deviceId: String,
    pushToken: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Index for geospatial queries
userSchema.index({ 
  "currentLocation.latitude": 1, 
  "currentLocation.longitude": 1 
});

// Index for location history
userSchema.index({ 
  "locationHistory.timestamp": -1 
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update last activity
userSchema.methods.updateActivity = function() {
  this.lastActivity = new Date();
  this.isActive = true;
  this.inactiveAlertSent = false;
  return this.save();
};

// Add location to history
userSchema.methods.addLocationHistory = function(latitude, longitude, address, safetyStatus = 'safe') {
  this.locationHistory.unshift({
    latitude,
    longitude,
    timestamp: new Date(),
    address,
    safetyStatus
  });
  
  // Keep only last 100 location records
  if (this.locationHistory.length > 100) {
    this.locationHistory = this.locationHistory.slice(0, 100);
  }
  
  return this.save();
};

// Get active emergency contacts
userSchema.methods.getEmergencyContacts = function() {
  return this.emergencyContacts.filter(contact => contact.phone);
};

module.exports = mongoose.model('User', userSchema);
