const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Location = require('../models/Location');
const SafeZone = require('../models/SafeZone');
const Alert = require('../models/Alert');
const auth = require('../middleware/auth');
const mapService = require('../services/mapService');
const anomalyDetectionGemini = require('../services/anomalyDetection');
const anomalyDetectionML = require('../services/anomalyML');
const logger = require('../utils/logger');
const { API_CONFIG } = require('../config/apis');

const router = express.Router();

// Update user location
router.post('/update', auth, [
  body('latitude').isFloat({ min: -90, max: 90 }),
  body('longitude').isFloat({ min: -180, max: 180 }),
  body('accuracy').optional().isFloat({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { latitude, longitude, accuracy, altitude, heading, speed } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get address using reverse geocoding
    let address = null;
    try {
      address = await mapService.reverseGeocode(latitude, longitude);
    } catch (error) {
      logger.warn('Reverse geocoding failed:', error.message);
    }

    // Check safe zones
    const nearbyZones = await SafeZone.findNearby(latitude, longitude, 2000);
    const containingZones = nearbyZones.filter(zone => 
      zone.containsPoint(latitude, longitude)
    );

    // Determine safety status
    let safetyStatus = 'unknown';
    let safetyScore = 50;
    let insideSafeZone = false;
    let safeZoneId = null;

    if (containingZones.length > 0) {
      const bestZone = containingZones.reduce((best, zone) => 
        zone.safetyScore > best.safetyScore ? zone : best
      );
      safetyStatus = 'safe';
      safetyScore = bestZone.safetyScore;
      insideSafeZone = true;
      safeZoneId = bestZone._id;
    } else {
      // Check if user was previously in a safe zone
      if (user.currentLocation && user.currentLocation.safetyStatus === 'safe') {
        safetyStatus = 'caution';
        safetyScore = 30;
        
        // Trigger geo-fence exit alert
        await triggerGeoFenceAlert(user, latitude, longitude, address);
      }
    }

    // Calculate movement data
    let movement = {
      isMoving: false,
      averageSpeed: 0,
      direction: null,
      distanceFromPrevious: 0,
      timeFromPrevious: 0
    };

    if (user.currentLocation) {
      const prevLat = user.currentLocation.latitude;
      const prevLng = user.currentLocation.longitude;
      const prevTime = user.currentLocation.timestamp;
      
      const distance = calculateDistance(prevLat, prevLng, latitude, longitude);
      const timeDiff = (Date.now() - new Date(prevTime)) / 1000; // seconds
      
      movement.distanceFromPrevious = distance;
      movement.timeFromPrevious = timeDiff;
      movement.averageSpeed = timeDiff > 0 ? (distance / timeDiff) * 3.6 : 0; // km/h
      movement.isMoving = movement.averageSpeed > 1; // Moving if > 1 km/h
      movement.direction = calculateDirection(prevLat, prevLng, latitude, longitude);
    }

    // Run anomaly detection
    let anomalyResult = { isAnomaly: false, confidence: 0, reasons: [] };
    
    try {
      // Get recent location history
      const recentLocations = await Location.find({ user: req.userId })
        .sort({ recordedAt: -1 })
        .limit(10);

      // Use Gemini AI for anomaly detection (primary)
      try {
        anomalyResult = await anomalyDetectionGemini.detectAnomaly({
          currentLocation: { latitude, longitude },
          recentLocations: recentLocations.map(loc => ({
            latitude: loc.coordinates.latitude,
            longitude: loc.coordinates.longitude,
            timestamp: loc.recordedAt,
            safetyStatus: loc.safetyStatus
          })),
          userProfile: {
            safetyScore: user.safetyScore,
            riskProfile: user.riskProfile,
            currentTrip: user.currentTrip
          },
          movement
        });
        anomalyResult.detectionMethod = 'gemini_ai';
      } catch (geminiError) {
        logger.warn('Gemini AI anomaly detection failed, falling back to ML model:', geminiError.message);
        
        // Fallback to custom ML model
        try {
          anomalyResult = await anomalyDetectionML.detectAnomaly({
            currentLocation: { latitude, longitude },
            recentLocations: recentLocations.map(loc => ({
              latitude: loc.coordinates.latitude,
              longitude: loc.coordinates.longitude,
              timestamp: loc.recordedAt
            })),
            movement
          });
          anomalyResult.detectionMethod = 'ml_model';
        } catch (mlError) {
          logger.warn('ML anomaly detection failed:', mlError.message);
          anomalyResult.detectionMethod = 'rule_based';
        }
      }
    } catch (error) {
      logger.error('Anomaly detection error:', error);
    }

    // Create location record
    const locationRecord = new Location({
      user: req.userId,
      coordinates: {
        latitude,
        longitude,
        accuracy: accuracy || 0,
        altitude,
        heading,
        speed
      },
      address: address ? {
        formatted: address.formatted_address,
        street: address.street,
        city: address.city,
        state: address.state,
        country: address.country,
        postalCode: address.postal_code
      } : null,
      safetyStatus,
      safetyScore,
      movement,
      anomaly: anomalyResult,
      geoFencing: {
        insideSafeZone,
        safeZoneId,
        distanceToSafeZone: insideSafeZone ? 0 : await getDistanceToNearestSafeZone(latitude, longitude)
      },
      source: 'gps',
      recordedAt: new Date()
    });

    await locationRecord.save();

    // Update user's current location
    user.currentLocation = {
      latitude,
      longitude,
      accuracy: accuracy || 0,
      timestamp: new Date(),
      address: address?.formatted_address || `${latitude}, ${longitude}`,
      safetyStatus
    };

    // Add to location history
    await user.addLocationHistory(latitude, longitude, address?.formatted_address, safetyStatus);
    
    // Update user activity
    await user.updateActivity();

    // Trigger anomaly alert if detected
    if (anomalyResult.isAnomaly && anomalyResult.confidence > 0.7) {
      await triggerAnomalyAlert(user, locationRecord, anomalyResult);
    }

    // Emit real-time location update
    const io = req.app.get('io');
    if (io) {
      io.emit('location-update', {
        userId: req.userId,
        location: {
          latitude,
          longitude,
          address: address?.formatted_address,
          safetyStatus,
          timestamp: new Date()
        }
      });
    }

    logger.info(`Location updated for user ${user.email}: ${latitude}, ${longitude}`);

    res.json({
      message: 'Location updated successfully',
      location: {
        coordinates: { latitude, longitude },
        address: address?.formatted_address,
        safetyStatus,
        safetyScore,
        insideSafeZone,
        movement,
        anomaly: {
          isAnomaly: anomalyResult.isAnomaly,
          confidence: anomalyResult.confidence
        }
      }
    });

  } catch (error) {
    logger.error('Location update error:', error);
    res.status(500).json({ error: 'Failed to update location' });
  }
});

// Get location history
router.get('/history', auth, async (req, res) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const locations = await Location.find({ user: req.userId })
      .sort({ recordedAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Location.countDocuments({ user: req.userId });

    res.json({
      locations,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: locations.length,
        totalRecords: total
      }
    });

  } catch (error) {
    logger.error('Location history error:', error);
    res.status(500).json({ error: 'Failed to fetch location history' });
  }
});

// Get nearby safe zones
router.get('/safe-zones/nearby', auth, async (req, res) => {
  try {
    const { latitude, longitude, radius = 5000 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const safeZones = await SafeZone.findNearby(
      parseFloat(latitude),
      parseFloat(longitude),
      parseInt(radius)
    );

    // Add distance to each zone
    const zonesWithDistance = safeZones.map(zone => ({
      ...zone.toObject(),
      distance: zone.distanceFrom(parseFloat(latitude), parseFloat(longitude))
    }));

    res.json({ safeZones: zonesWithDistance });

  } catch (error) {
    logger.error('Nearby safe zones error:', error);
    res.status(500).json({ error: 'Failed to fetch nearby safe zones' });
  }
});

// Get places of interest nearby
router.get('/nearby-places', auth, async (req, res) => {
  try {
    const { latitude, longitude, type, radius = 2000 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const places = await mapService.getNearbyPlaces(
      parseFloat(latitude),
      parseFloat(longitude),
      type,
      parseInt(radius)
    );

    res.json({ places });

  } catch (error) {
    logger.error('Nearby places error:', error);
    res.status(500).json({ error: 'Failed to fetch nearby places' });
  }
});

// Helper functions
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function calculateDirection(lat1, lon1, lat2, lon2) {
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const y = Math.sin(dLon) * Math.cos(lat2 * Math.PI / 180);
  const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
    Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLon);
  
  let bearing = Math.atan2(y, x) * 180 / Math.PI;
  bearing = (bearing + 360) % 360;
  
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return directions[Math.round(bearing / 45) % 8];
}

async function getDistanceToNearestSafeZone(latitude, longitude) {
  const nearestZone = await SafeZone.findOne({
    status: 'active'
  }).sort({
    center: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [longitude, latitude]
        }
      }
    }
  });

  if (nearestZone) {
    return nearestZone.distanceFrom(latitude, longitude);
  }
  return null;
}

async function triggerGeoFenceAlert(user, latitude, longitude, address) {
  try {
    const alert = new Alert({
      user: user._id,
      type: 'geo_fence_exit',
      severity: 'high',
      title: 'Left Safe Zone',
      message: `${user.firstName} has left a designated safe zone`,
      location: {
        coordinates: { latitude, longitude },
        address: address ? {
          formatted: address.formatted_address,
          city: address.city,
          country: address.country
        } : null,
        safetyStatus: 'caution'
      },
      geoFencingData: {
        exitTime: new Date(),
        timeOutsideZone: 0
      }
    });

    await alert.save();
    logger.info(`Geo-fence exit alert created for user: ${user.email}`);
    
    // Emit real-time alert
    const io = require('../server').io;
    if (io) {
      io.emit('geo-fence-alert', {
        userId: user._id,
        alert: alert
      });
    }
  } catch (error) {
    logger.error('Failed to create geo-fence alert:', error);
  }
}

async function triggerAnomalyAlert(user, location, anomalyResult) {
  try {
    const alert = new Alert({
      user: user._id,
      type: 'anomaly',
      severity: anomalyResult.confidence > 0.9 ? 'critical' : 'high',
      title: 'Unusual Activity Detected',
      message: `Suspicious movement pattern detected for ${user.firstName}`,
      location: {
        coordinates: location.coordinates,
        address: location.address,
        safetyStatus: location.safetyStatus
      },
      anomalyData: {
        confidence: anomalyResult.confidence,
        reasons: anomalyResult.reasons,
        detectionMethod: anomalyResult.detectionMethod,
        modelVersion: anomalyResult.modelVersion
      }
    });

    await alert.save();
    logger.info(`Anomaly alert created for user: ${user.email}`);

    // Emit real-time alert
    const io = require('../server').io;
    if (io) {
      io.emit('anomaly-alert', {
        userId: user._id,
        alert: alert
      });
    }
  } catch (error) {
    logger.error('Failed to create anomaly alert:', error);
  }
}

module.exports = router;