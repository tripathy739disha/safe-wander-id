const mongoose = require('mongoose');

const safeZoneSchema = new mongoose.Schema({
  // Basic information
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  description: {
    type: String,
    trim: true
  },
  
  type: {
    type: String,
    enum: ['tourist_zone', 'embassy', 'police_station', 'hospital', 'hotel', 'airport', 'custom'],
    required: true
  },
  
  // Geographic definition
  center: {
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180
    }
  },
  
  // Zone boundaries
  radius: {
    type: Number,
    required: true,
    min: 10, // minimum 10 meters
    max: 50000, // maximum 50km
    default: 500
  },
  
  // Alternative polygon definition (for irregular zones)
  polygon: [{
    latitude: Number,
    longitude: Number
  }],
  
  // Address information
  address: {
    formatted: String,
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String,
    landmark: String
  },
  
  // Safety metrics
  safetyLevel: {
    type: String,
    enum: ['very_safe', 'safe', 'moderate', 'caution'],
    default: 'safe'
  },
  
  safetyScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 85
  },
  
  // Risk assessment
  riskFactors: [{
    type: {
      type: String,
      enum: ['crime', 'natural_disaster', 'political_unrest', 'health', 'traffic', 'weather', 'terrorism']
    },
    level: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    description: String,
    lastUpdated: Date
  }],
  
  // Services and amenities
  services: [{
    type: {
      type: String,
      enum: ['medical', 'police', 'fire', 'embassy', 'hotel', 'restaurant', 'transport', 'bank', 'pharmacy', 'wifi']
    },
    name: String,
    contact: String,
    available24x7: {
      type: Boolean,
      default: false
    },
    description: String
  }],
  
  // Operating hours
  operatingHours: {
    alwaysActive: {
      type: Boolean,
      default: true
    },
    schedule: [{
      day: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      },
      open: String, // HH:MM format
      close: String, // HH:MM format
      closed: {
        type: Boolean,
        default: false
      }
    }]
  },
  
  // Contact information
  contacts: [{
    type: {
      type: String,
      enum: ['emergency', 'information', 'booking', 'security']
    },
    phone: String,
    email: String,
    name: String,
    available24x7: {
      type: Boolean,
      default: false
    }
  }],
  
  // Zone status
  status: {
    type: String,
    enum: ['active', 'inactive', 'temporary', 'under_review'],
    default: 'active'
  },
  
  // Capacity and occupancy (for hotels, hospitals, etc.)
  capacity: {
    total: Number,
    current: Number,
    available: Number,
    lastUpdated: Date
  },
  
  // User data
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Verification status
  verification: {
    isVerified: {
      type: Boolean,
      default: false
    },
    verifiedAt: Date,
    verificationMethod: {
      type: String,
      enum: ['manual', 'api', 'government_data', 'crowdsourced']
    },
    verificationNotes: String
  },
  
  // Statistics
  stats: {
    usersInZone: {
      type: Number,
      default: 0
    },
    totalVisits: {
      type: Number,
      default: 0
    },
    averageStayDuration: Number, // minutes
    lastVisit: Date,
    alertsGenerated: {
      type: Number,
      default: 0
    }
  },
  
  // Dynamic updates
  conditions: {
    weather: {
      current: String,
      temperature: Number,
      humidity: Number,
      lastUpdated: Date
    },
    traffic: {
      level: {
        type: String,
        enum: ['light', 'moderate', 'heavy', 'blocked']
      },
      lastUpdated: Date
    },
    crowding: {
      level: {
        type: String,
        enum: ['low', 'moderate', 'high', 'overcrowded']
      },
      lastUpdated: Date
    }
  },
  
  // Notifications settings
  notifications: {
    entryAlert: {
      type: Boolean,
      default: true
    },
    exitAlert: {
      type: Boolean,
      default: true
    },
    capacityAlert: {
      type: Boolean,
      default: false
    },
    statusChangeAlert: {
      type: Boolean,
      default: true
    }
  },
  
  // Metadata
  metadata: {
    source: {
      type: String,
      enum: ['admin', 'api', 'government', 'user_generated', 'ml_detected']
    },
    tags: [String],
    category: String,
    priority: {
      type: Number,
      min: 1,
      max: 10,
      default: 5
    }
  },
  
  // Validity period
  validFrom: {
    type: Date,
    default: Date.now
  },
  
  validUntil: {
    type: Date,
    default: null // null means indefinite
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient queries
safeZoneSchema.index({ "center.latitude": 1, "center.longitude": 1 });
safeZoneSchema.index({ type: 1, status: 1 });
safeZoneSchema.index({ safetyLevel: 1 });
safeZoneSchema.index({ "metadata.priority": -1 });

// Geospatial index for proximity queries
safeZoneSchema.index({ 
  center: "2dsphere" 
});

// Index for polygon zones
safeZoneSchema.index({ polygon: "2dsphere" });

// Virtual for current occupancy percentage
safeZoneSchema.virtual('occupancyPercentage').get(function() {
  if (!this.capacity.total || this.capacity.total === 0) return 0;
  return Math.round((this.capacity.current / this.capacity.total) * 100);
});

// Virtual for availability status
safeZoneSchema.virtual('availabilityStatus').get(function() {
  const occupancy = this.occupancyPercentage;
  if (occupancy >= 95) return 'full';
  if (occupancy >= 80) return 'nearly_full';
  if (occupancy >= 50) return 'moderate';
  return 'available';
});

// Method to check if a point is within the safe zone
safeZoneSchema.methods.containsPoint = function(latitude, longitude) {
  // If polygon is defined, use polygon check
  if (this.polygon && this.polygon.length > 0) {
    return this.pointInPolygon(latitude, longitude);
  }
  
  // Otherwise, use radius check
  const distance = this.distanceFrom(latitude, longitude);
  return distance <= this.radius;
};

// Method to calculate distance from center
safeZoneSchema.methods.distanceFrom = function(latitude, longitude) {
  const R = 6371000; // Earth's radius in meters
  const dLat = (latitude - this.center.latitude) * Math.PI / 180;
  const dLng = (longitude - this.center.longitude) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(this.center.latitude * Math.PI / 180) * Math.cos(latitude * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Method for point-in-polygon check
safeZoneSchema.methods.pointInPolygon = function(latitude, longitude) {
  const polygon = this.polygon;
  let inside = false;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    if (((polygon[i].latitude > latitude) !== (polygon[j].latitude > latitude)) &&
        (longitude < (polygon[j].longitude - polygon[i].longitude) * (latitude - polygon[i].latitude) / 
         (polygon[j].latitude - polygon[i].latitude) + polygon[i].longitude)) {
      inside = !inside;
    }
  }
  
  return inside;
};

// Method to check if zone is currently active
safeZoneSchema.methods.isActive = function() {
  if (this.status !== 'active') return false;
  
  const now = new Date();
  if (this.validUntil && now > this.validUntil) return false;
  if (now < this.validFrom) return false;
  
  // Check operating hours if not always active
  if (!this.operatingHours.alwaysActive) {
    const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
    const todaySchedule = this.operatingHours.schedule.find(s => s.day === dayOfWeek);
    
    if (todaySchedule && todaySchedule.closed) return false;
    
    if (todaySchedule) {
      const currentTime = now.getHours() * 100 + now.getMinutes();
      const openTime = parseInt(todaySchedule.open.replace(':', ''));
      const closeTime = parseInt(todaySchedule.close.replace(':', ''));
      
      if (currentTime < openTime || currentTime > closeTime) return false;
    }
  }
  
  return true;
};

// Static method to find safe zones near a location
safeZoneSchema.statics.findNearby = function(latitude, longitude, maxDistance = 5000) {
  return this.find({
    status: 'active',
    center: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance
      }
    }
  });
};

// Static method to find zones containing a point
safeZoneSchema.statics.findContaining = function(latitude, longitude) {
  return this.find({
    status: 'active',
    $or: [
      // Check radius-based zones
      {
        center: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [longitude, latitude]
            },
            $maxDistance: { $exists: true }
          }
        }
      },
      // Check polygon-based zones
      {
        polygon: {
          $geoIntersects: {
            $geometry: {
              type: "Point",
              coordinates: [longitude, latitude]
            }
          }
        }
      }
    ]
  });
};

module.exports = mongoose.model('SafeZone', safeZoneSchema);
