const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Geographic coordinates
  coordinates: {
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
    },
    accuracy: {
      type: Number,
      default: 0
    },
    altitude: {
      type: Number,
      default: null
    },
    heading: {
      type: Number,
      default: null
    },
    speed: {
      type: Number,
      default: null
    }
  },
  
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
  
  // Location metadata
  source: {
    type: String,
    enum: ['gps', 'network', 'manual', 'ip'],
    default: 'gps'
  },
  
  // Safety assessment
  safetyStatus: {
    type: String,
    enum: ['safe', 'caution', 'warning', 'danger', 'unknown'],
    default: 'unknown'
  },
  
  safetyScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  
  // Risk factors
  riskFactors: [{
    type: {
      type: String,
      enum: ['crime', 'natural_disaster', 'political_unrest', 'health', 'traffic', 'weather']
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    description: String,
    source: String
  }],
  
  // Zone information
  zones: [{
    type: {
      type: String,
      enum: ['safe_zone', 'tourist_zone', 'restricted_zone', 'danger_zone', 'neutral_zone']
    },
    name: String,
    radius: Number, // in meters
    description: String
  }],
  
  // Nearby points of interest
  nearbyPOIs: [{
    name: String,
    type: {
      type: String,
      enum: ['hospital', 'police_station', 'embassy', 'hotel', 'restaurant', 'tourist_attraction', 'transport']
    },
    distance: Number, // in meters
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    contact: String,
    isEmergencyService: {
      type: Boolean,
      default: false
    }
  }],
  
  // Movement analysis
  movement: {
    isMoving: {
      type: Boolean,
      default: false
    },
    averageSpeed: {
      type: Number,
      default: 0
    },
    direction: String, // N, NE, E, SE, S, SW, W, NW
    distanceFromPrevious: {
      type: Number,
      default: 0
    },
    timeFromPrevious: {
      type: Number,
      default: 0
    }
  },
  
  // Anomaly detection results
  anomaly: {
    isAnomaly: {
      type: Boolean,
      default: false
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    },
    reasons: [String],
    modelVersion: String,
    detectionMethod: {
      type: String,
      enum: ['ml_model', 'gemini_ai', 'rule_based'],
      default: 'rule_based'
    }
  },
  
  // Geo-fencing status
  geoFencing: {
    insideSafeZone: {
      type: Boolean,
      default: true
    },
    safeZoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SafeZone',
      default: null
    },
    distanceToSafeZone: {
      type: Number,
      default: 0
    },
    alertTriggered: {
      type: Boolean,
      default: false
    },
    exitTime: {
      type: Date,
      default: null
    }
  },
  
  // Weather and environmental data
  environment: {
    temperature: Number,
    humidity: Number,
    weather: String,
    visibility: Number,
    airQuality: {
      aqi: Number,
      category: String
    }
  },
  
  // Verification and quality
  verified: {
    type: Boolean,
    default: false
  },
  
  quality: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  
  // Metadata
  deviceInfo: {
    userAgent: String,
    platform: String,
    appVersion: String
  },
  
  // Timestamps
  recordedAt: {
    type: Date,
    default: Date.now
  },
  
  processedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient queries
locationSchema.index({ user: 1, recordedAt: -1 });
locationSchema.index({ "coordinates.latitude": 1, "coordinates.longitude": 1 });
locationSchema.index({ safetyStatus: 1 });
locationSchema.index({ "anomaly.isAnomaly": 1 });
locationSchema.index({ "geoFencing.insideSafeZone": 1 });

// Geospatial index for proximity queries
locationSchema.index({ 
  "coordinates": "2dsphere" 
});

// Virtual for formatted coordinates
locationSchema.virtual('coordinatesString').get(function() {
  return `${this.coordinates.latitude}, ${this.coordinates.longitude}`;
});

// Method to calculate distance from another location
locationSchema.methods.distanceFrom = function(lat, lng) {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat - this.coordinates.latitude) * Math.PI / 180;
  const dLng = (lng - this.coordinates.longitude) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(this.coordinates.latitude * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Method to check if location is within safe zone
locationSchema.methods.isInSafeZone = function(safeZones) {
  for (const zone of safeZones) {
    const distance = this.distanceFrom(zone.center.latitude, zone.center.longitude);
    if (distance <= zone.radius) {
      return { inZone: true, zone: zone, distance: distance };
    }
  }
  return { inZone: false, zone: null, distance: null };
};

// Static method to find locations within radius
locationSchema.statics.findWithinRadius = function(lat, lng, radius) {
  return this.find({
    "coordinates": {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [lng, lat]
        },
        $maxDistance: radius
      }
    }
  });
};

module.exports = mongoose.model('Location', locationSchema);