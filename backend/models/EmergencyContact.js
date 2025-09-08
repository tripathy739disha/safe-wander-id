const mongoose = require('mongoose');

const emergencyContactSchema = new mongoose.Schema({
  // Owner of the emergency contact
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Contact basic information
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  relationship: {
    type: String,
    enum: ['spouse', 'parent', 'sibling', 'child', 'friend', 'colleague', 'guardian', 'relative', 'other'],
    required: true
  },
  
  // Contact details
  phone: {
    primary: {
      type: String,
      required: true
    },
    secondary: {
      type: String,
      default: null
    },
    whatsapp: {
      type: String,
      default: null
    }
  },
  
  email: {
    primary: {
      type: String,
      lowercase: true,
      trim: true
    },
    secondary: {
      type: String,
      lowercase: true,
      trim: true
    }
  },
  
  // Address information
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // Priority and preferences
  priority: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  
  isPrimary: {
    type: Boolean,
    default: false
  },
  
  // Contact preferences
  contactPreferences: {
    preferredMethod: {
      type: String,
      enum: ['sms', 'call', 'email', 'whatsapp'],
      default: 'sms'
    },
    
    callAllowed: {
      type: Boolean,
      default: true
    },
    
    smsAllowed: {
      type: Boolean,
      default: true
    },
    
    emailAllowed: {
      type: Boolean,
      default: true
    },
    
    whatsappAllowed: {
      type: Boolean,
      default: false
    },
    
    // Time preferences
    availableHours: {
      start: {
        type: String,
        default: '00:00' // 24-hour format
      },
      end: {
        type: String,
        default: '23:59'
      },
      timezone: {
        type: String,
        default: 'Asia/Kolkata'
      }
    },
    
    // Emergency override (contact even outside available hours)
    emergencyOverride: {
      type: Boolean,
      default: true
    }
  },
  
  // Alert settings
  alertSettings: {
    // Which types of alerts to send to this contact
    sosAlerts: {
      type: Boolean,
      default: true
    },
    
    geoFenceAlerts: {
      type: Boolean,
      default: true
    },
    
    inactivityAlerts: {
      type: Boolean,
      default: true
    },
    
    anomalyAlerts: {
      type: Boolean,
      default: false
    },
    
    // Delay before notifying (in minutes)
    notificationDelay: {
      type: Number,
      min: 0,
      max: 60,
      default: 0
    },
    
    // Auto escalation if no response
    autoEscalation: {
      type: Boolean,
      default: true
    },
    
    escalationDelay: {
      type: Number,
      min: 5,
      max: 120,
      default: 30 // minutes
    }
  },
  
  // Medical and special information
  medicalInfo: {
    profession: String, // doctor, nurse, paramedic, etc.
    specialization: String,
    licenseNumber: String,
    hospitalAffiliation: String
  },
  
  // Language preferences
  language: {
    type: String,
    enum: ['en', 'hi', 'es', 'fr', 'de', 'zh', 'ja', 'ar'],
    default: 'en'
  },
  
  // Status and verification
  status: {
    type: String,
    enum: ['active', 'inactive', 'blocked', 'unverified'],
    default: 'unverified'
  },
  
  verification: {
    phoneVerified: {
      type: Boolean,
      default: false
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    verificationCode: String,
    verificationAttempts: {
      type: Number,
      default: 0
    },
    lastVerificationAttempt: Date,
    verifiedAt: Date
  },
  
  // Communication history
  communicationHistory: [{
    type: {
      type: String,
      enum: ['sms', 'call', 'email', 'whatsapp', 'push']
    },
    alertId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Alert'
    },
    content: String,
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read', 'failed', 'pending']
    },
    response: String,
    responseTime: Number, // seconds
    sentAt: Date,
    deliveredAt: Date,
    readAt: Date,
    respondedAt: Date
  }],
  
  // Response statistics
  responseStats: {
    totalAlerts: {
      type: Number,
      default: 0
    },
    totalResponses: {
      type: Number,
      default: 0
    },
    averageResponseTime: {
      type: Number,
      default: 0 // seconds
    },
    responseRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0 // percentage
    },
    lastResponse: Date,
    fastestResponse: Number, // seconds
    slowestResponse: Number // seconds
  },
  
  // Emergency contact group
  group: {
    type: String,
    enum: ['family', 'friends', 'medical', 'work', 'local', 'authorities'],
    default: 'family'
  },
  
  // Additional notes
  notes: {
    type: String,
    maxlength: 500
  },
  
  // Metadata
  metadata: {
    addedBy: {
      type: String,
      enum: ['user', 'import', 'admin'],
      default: 'user'
    },
    source: String, // contacts_app, manual_entry, etc.
    lastContactedAt: Date,
    totalContacts: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient queries
emergencyContactSchema.index({ user: 1, priority: -1 });
emergencyContactSchema.index({ user: 1, isPrimary: -1 });
emergencyContactSchema.index({ user: 1, status: 1 });
emergencyContactSchema.index({ 'phone.primary': 1 });
emergencyContactSchema.index({ 'email.primary': 1 });

// Virtual for formatted name with relationship
emergencyContactSchema.virtual('displayName').get(function() {
  return `${this.name} (${this.relationship})`;
});

// Virtual for best contact method
emergencyContactSchema.virtual('bestContactMethod').get(function() {
  const prefs = this.contactPreferences;
  
  // Return preferred method if allowed
  if (prefs.preferredMethod === 'sms' && prefs.smsAllowed) return 'sms';
  if (prefs.preferredMethod === 'call' && prefs.callAllowed) return 'call';
  if (prefs.preferredMethod === 'email' && prefs.emailAllowed) return 'email';
  if (prefs.preferredMethod === 'whatsapp' && prefs.whatsappAllowed) return 'whatsapp';
  
  // Fallback to first available method
  if (prefs.smsAllowed) return 'sms';
  if (prefs.callAllowed) return 'call';
  if (prefs.emailAllowed) return 'email';
  if (prefs.whatsappAllowed) return 'whatsapp';
  
  return 'sms'; // ultimate fallback
});

// Method to check if contact is available now
emergencyContactSchema.methods.isAvailableNow = function() {
  const now = new Date();
  const hours = this.contactPreferences.availableHours;
  
  // If emergency override is enabled, always available
  if (this.contactPreferences.emergencyOverride) return true;
  
  // Check time range
  const currentTime = now.getHours() * 100 + now.getMinutes();
  const startTime = parseInt(hours.start.replace(':', ''));
  const endTime = parseInt(hours.end.replace(':', ''));
  
  return currentTime >= startTime && currentTime <= endTime;
};

// Method to record communication
emergencyContactSchema.methods.recordCommunication = function(type, alertId, content, status = 'sent') {
  this.communicationHistory.unshift({
    type,
    alertId,
    content,
    status,
    sentAt: new Date()
  });
  
  // Keep only last 100 communications
  if (this.communicationHistory.length > 100) {
    this.communicationHistory = this.communicationHistory.slice(0, 100);
  }
  
  // Update stats
  this.responseStats.totalAlerts += 1;
  this.metadata.totalContacts += 1;
  this.metadata.lastContactedAt = new Date();
  
  return this.save();
};

// Method to record response
emergencyContactSchema.methods.recordResponse = function(communicationId, response, responseTime) {
  const comm = this.communicationHistory.id(communicationId);
  if (comm) {
    comm.response = response;
    comm.responseTime = responseTime;
    comm.respondedAt = new Date();
    comm.status = 'read';
    
    // Update response stats
    this.responseStats.totalResponses += 1;
    this.responseStats.lastResponse = new Date();
    
    // Calculate response rate
    this.responseStats.responseRate = Math.round(
      (this.responseStats.totalResponses / this.responseStats.totalAlerts) * 100
    );
    
    // Update response time stats
    const totalTime = (this.responseStats.averageResponseTime * (this.responseStats.totalResponses - 1)) + responseTime;
    this.responseStats.averageResponseTime = Math.round(totalTime / this.responseStats.totalResponses);
    
    if (!this.responseStats.fastestResponse || responseTime < this.responseStats.fastestResponse) {
      this.responseStats.fastestResponse = responseTime;
    }
    
    if (!this.responseStats.slowestResponse || responseTime > this.responseStats.slowestResponse) {
      this.responseStats.slowestResponse = responseTime;
    }
    
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Static method to get primary contacts for user
emergencyContactSchema.statics.getPrimaryContacts = function(userId) {
  return this.find({
    user: userId,
    status: 'active',
    isPrimary: true
  }).sort({ priority: -1 });
};

// Static method to get contacts by group
emergencyContactSchema.statics.getByGroup = function(userId, group) {
  return this.find({
    user: userId,
    status: 'active',
    group: group
  }).sort({ priority: -1 });
};

// Static method to get best responders
emergencyContactSchema.statics.getBestResponders = function(userId, limit = 3) {
  return this.find({
    user: userId,
    status: 'active'
  })
  .sort({ 
    'responseStats.responseRate': -1, 
    'responseStats.averageResponseTime': 1,
    priority: -1 
  })
  .limit(limit);
};

module.exports = mongoose.model('EmergencyContact', emergencyContactSchema);
