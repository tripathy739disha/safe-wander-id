const logger = require('../utils/logger');

const API_CONFIG = {
  // MyMapIndia API Configuration
  MYMAP_INDIA: {
    BASE_URL: 'https://apis.mapmyindia.com/advancedmaps/v1',
    API_KEY: process.env.MYMAP_INDIA_API_KEY || 'your_mymap_india_api_key',
    CLIENT_ID: process.env.MYMAP_INDIA_CLIENT_ID || 'your_client_id',
    CLIENT_SECRET: process.env.MYMAP_INDIA_CLIENT_SECRET || 'your_client_secret',
    ENDPOINTS: {
      GEOCODING: '/geocoding',
      REVERSE_GEOCODING: '/rev_geocoding',
      ROUTE_ADDUCTION: '/route_adv/driving',
      DISTANCE_MATRIX: '/distance_matrix/driving',
      NEARBY_SEARCH: '/nearby/json',
      PLACE_DETAILS: '/place_detail/json'
    }
  },

  // SMS Gateway Configuration
  SMS_GATEWAY: {
    TWILIO: {
      ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || 'your_twilio_account_sid',
      AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || 'your_twilio_auth_token',
      PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER || '+1234567890'
    },
    // Alternative SMS services
    MSG91: {
      API_KEY: process.env.MSG91_API_KEY || 'your_msg91_api_key',
      SENDER_ID: process.env.MSG91_SENDER_ID || 'SAFWND',
      ROUTE: '4'
    }
  },

  // Google Gemini AI Configuration
  GEMINI_AI: {
    API_KEY: process.env.GEMINI_API_KEY || 'your_gemini_api_key',
    MODEL: 'gemini-pro',
    BASE_URL: 'https://generativelanguage.googleapis.com/v1beta/models'
  },

  // Emergency Services Configuration
  EMERGENCY_SERVICES: {
    POLICE: '100',
    FIRE: '101',
    AMBULANCE: '102',
    DISASTER_MANAGEMENT: '108',
    WOMEN_HELPLINE: '1091',
    CHILD_HELPLINE: '1098',
    TOURIST_HELPLINE: '1363'
  },

  // Geo-fencing Configuration
  GEOFENCING: {
    SAFE_ZONE_RADIUS: 500, // meters
    DANGER_ZONE_RADIUS: 1000, // meters
    CHECK_INTERVAL: 30000, // 30 seconds
    INACTIVE_THRESHOLD: 5 * 60 * 60 * 1000, // 5 hours in milliseconds
  },

  // Rate Limiting Configuration
  RATE_LIMITS: {
    SOS_COOLDOWN: 60000, // 1 minute
    LOCATION_UPDATE_INTERVAL: 10000, // 10 seconds
    ALERT_FREQUENCY: 300000, // 5 minutes
  }
};

// Validation functions
const validateAPIKeys = () => {
  const requiredKeys = [
    'MYMAP_INDIA_API_KEY',
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'GEMINI_API_KEY'
  ];

  const missing = requiredKeys.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    logger.warn(`Missing API keys: ${missing.join(', ')}`);
    console.warn(`⚠️  Missing API keys: ${missing.join(', ')}`);
  }
};

// Initialize API validation
validateAPIKeys();

module.exports = { API_CONFIG };