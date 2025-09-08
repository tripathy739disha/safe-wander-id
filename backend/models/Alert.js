const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  // Basic alert information
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  type: {
    type: String,
    enum: ['sos', 'geo_fence_exit', 'inactivity', 'anomaly', 'manual', 'zone_warning', 'emergency_contact'],
    required: true
  },
  
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical', 'emergency'],
    required: true,
    default: 'medium'
  },
  
  status: {
    type: String,
    enum: ['active', 'acknowledged', 'resolved', 'false_alarm', 'escalated'],
    default: 'active'
  },
  
  // Alert content
  title: {
    type: String,
    required: true
  },
  
  message: {
    type: String,
    required: true
  },
  
  description: {
    type: String,
    default: ''
  },
  
  // Location information
  location: {
    coordinates: {
      latitude: {
        type: Number,
        required: true
      },
      longitude: {
        type: Number,
        required: true
      },
      accuracy: Number
    },
    address: {
      formatted: String,
      street: String,
      city: String,
      state: String,
      country: String,
      landmark: String
    },
    safetyStatus: {
      type: String,
      enum: ['safe', 'caution', 'warning', 'danger'],
      default: 'warning'
    }
  },
  
  // SOS specific data
  sosData: {
    countdown: {
      type: Number,
      default: 10 // seconds
    },
    autoTriggered: {
      type: Boolean,
      default: false
    },
    cancelled: {
      type: Boolean,
      default: false
    },
    cancelledAt: {
      type: Date,
      default: null
    },
    actualEmergency: {
      type: Boolean,
      default: null
    }
  },
  
  // Geo-fencing data
  geoFencingData: {
    safeZoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SafeZone'
    },
    safeZoneName: String,
    distanceFromZone: Number, // meters
    exitTime: Date,
    timeOutsideZone: Number // minutes
  },
  
  // Inactivity data
  inactivityData: {
    lastActivity: Date,
    inactiveDuration: Number, // minutes
    threshold: {
      type: Number,
      default: 300 // 5 hours in minutes
    },
    locationStatic: {
      type: Boolean,
      default: false
    }
  },
  
  // Anomaly detection data
  anomalyData: {
    confidence: {
      type: Number,
      min: 0,
      max: 1
    },
    reasons: [String],
    modelVersion: String,
    detectionMethod: {
      type: String,
      enum: ['ml_model', 'gemini_ai', 'rule_based']
    },
    previousLocations: [{
      latitude: Number,
      longitude: Number,
      timestamp: Date
    }]
  },
  
  // Response and escalation
  responses: [{
    responderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    responderType: {
      type: String,
      enum: ['user', 'emergency_contact', 'police', 'system']
    },
    action: {
      type: String,
      enum: ['acknowledged', 'responding', 'resolved', 'escalated', 'cancelled']
    },
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    location: {
      latitude: Number,
      longitude: Number
    }
  }],
  
  // Escalation information
  escalation: {
    level: {
      type: Number,
      default: 0 // 0: initial, 1: contacts, 2: authorities, 3: emergency services
    },
    escalatedAt: Date,
    escalatedTo: [{
      type: {
        type: String,
        enum: ['emergency_contact', 'police', 'medical', 'fire', 'embassy']
      },
      contactInfo: String,
      notified: {
        type: Boolean,
        default: false
      },
      notifiedAt: Date,
      response: String
    }],
    autoEscalation: {
      type: Boolean,
      default: true
    },
    escalationTimeout: {
      type: Number,
      default: 15 // minutes
    }
  },
  
  // Communication logs
  communications: [{
    type: {
      type: String,
      enum: ['sms', 'email', 'push', 'call', 'webhook']
    },
    recipient: String,
    content: String,
    status: {
      type: String,
      enum: ['sent', 'delivered', 'failed', 'pending']
    },
    provider: String, // twilio, msg91, etc.
    messageId: String,
    sentAt: Date,
    deliveredAt: Date,
    error: String
  }],
  
  // E-FIR information (for serious incidents)
  efir: {
    generated: {
      type: Boolean,
      default: false
    },
    firNumber: String,
    policeStation: String,
    officerInCharge: String,
    generateAt: Date,
    status: {
      type: String,
      enum: ['pending', 'filed', 'investigating', 'closed']
    },
    documents: [String] // URLs to related documents
  },
  
  // Media attachments
  media: [{
    type: {
      type: String,
      enum: ['image', 'video', 'audio', 'document']
    },
    url: String,
    filename: String,
    size: Number,
    uploadedAt: Date,
    description: String
  }],
  
  // System metadata
  metadata: {
    source: {
      type: String,
      enum: ['mobile_app', 'web_app', 'system', 'api', 'webhook'],
      default: 'mobile_app'
    },
    deviceInfo: {
      platform: String,
      version: String,
      userAgent: String
    },
    ipAddress: String,
    sessionId: String,
    correlationId: String // for tracking related alerts
  },
  
  // Timestamps
  triggeredAt: {
    type: Date,
    default: Date.now
  },
  
  acknowledgedAt: Date,
  resolvedAt: Date,
  
  // Expiry for cleanup
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient queries
alertSchema.index({ user: 1, triggeredAt: -1 });
alertSchema.index({ type: 1, status: 1 });
alertSchema.index({ severity: 1, status: 1 });
alertSchema.index({ "location.coordinates.latitude": 1, "location.coordinates.longitude": 1 });
alertSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for duration
alertSchema.virtual('duration').get(function() {
  const end = this.resolvedAt || new Date();
  return Math.round((end - this.triggeredAt) / 1000 / 60); // minutes
});

// Virtual for response time
alertSchema.virtual('responseTime').get(function() {
  if (!this.acknowledgedAt) return null;
  return Math.round((this.acknowledgedAt - this.triggeredAt) / 1000); // seconds
});

// Method to escalate alert
alertSchema.methods.escalate = function(reason) {
  this.escalation.level += 1;
  this.escalation.escalatedAt = new Date();
  this.status = 'escalated';
  
  this.responses.push({
    responderType: 'system',
    action: 'escalated',
    message: reason || 'Auto-escalated due to timeout',
    timestamp: new Date()
  });
  
  return this.save();
};

// Method to acknowledge alert
alertSchema.methods.acknowledge = function(responderId, responderType, message) {
  this.status = 'acknowledged';
  this.acknowledgedAt = new Date();
  
  this.responses.push({
    responderId,
    responderType,
    action: 'acknowledged',
    message,
    timestamp: new Date()
  });
  
  return this.save();
};

// Method to resolve alert
alertSchema.methods.resolve = function(responderId, responderType, message) {
  this.status = 'resolved';
  this.resolvedAt = new Date();
  
  this.responses.push({
    responderId,
    responderType,
    action: 'resolved',
    message,
    timestamp: new Date()
  });
  
  return this.save();
};

// Static method to find active alerts
alertSchema.statics.findActive = function(userId) {
  return this.find({
    user: userId,
    status: { $in: ['active', 'acknowledged', 'escalated'] }
  }).sort({ triggeredAt: -1 });
};

// Static method to find nearby active alerts
alertSchema.statics.findNearbyActive = function(lat, lng, radius = 5000) {
  return this.find({
    status: { $in: ['active', 'acknowledged', 'escalated'] },
    "location.coordinates": {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [lng, lat]
        },
        $maxDistance: radius
      }
    }
  }).populate('user', 'firstName lastName phone');
};

module.exports = mongoose.model('Alert', alertSchema);