const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Alert = require('../models/Alert');
const Location = require('../models/Location');
const mapService = require('../services/mapService');
const eFireService = require('../services/eFireService');
const logger = require('../utils/logger');

const router = express.Router();

// Police authentication middleware (simplified)
const policeAuth = (req, res, next) => {
  const apiKey = req.headers['x-police-api-key'];
  
  // In production, implement proper police authentication
  if (!apiKey || apiKey !== process.env.POLICE_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized access' });
  }
  
  req.policeOfficer = {
    id: 'officer-123', // Would come from actual auth
    name: 'Officer Smith',
    station: 'Central Police Station',
    badgeNumber: 'P001'
  };
  
  next();
};

// Get all active alerts for police dashboard
router.get('/alerts/active', policeAuth, async (req, res) => {
  try {
    const { severity, type, limit = 50 } = req.query;
    
    const query = {
      status: { $in: ['active', 'acknowledged', 'escalated'] }
    };
    
    if (severity) query.severity = severity;
    if (type) query.type = type;

    const alerts = await Alert.find(query)
      .populate('user', 'firstName lastName phone nationality passportNumber safetyScore')
      .sort({ severity: -1, triggeredAt: -1 })
      .limit(parseInt(limit));

    // Add real-time location data
    const alertsWithLocation = await Promise.all(
      alerts.map(async (alert) => {
        const recentLocation = await Location.findOne({ user: alert.user._id })
          .sort({ recordedAt: -1 });

        return {
          ...alert.toObject(),
          recentLocation: recentLocation ? {
            coordinates: recentLocation.coordinates,
            address: recentLocation.address,
            safetyStatus: recentLocation.safetyStatus,
            recordedAt: recentLocation.recordedAt
          } : null
        };
      })
    );

    res.json({
      alerts: alertsWithLocation,
      summary: {
        total: alerts.length,
        emergency: alerts.filter(a => a.severity === 'emergency').length,
        critical: alerts.filter(a => a.severity === 'critical').length,
        high: alerts.filter(a => a.severity === 'high').length
      }
    });

  } catch (error) {
    logger.error('Police alerts fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Get specific alert details
router.get('/alerts/:alertId', policeAuth, async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.alertId)
      .populate('user', 'firstName lastName phone email nationality passportNumber safetyScore emergencyContacts currentTrip');

    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    // Get user's recent location history
    const locationHistory = await Location.find({ user: alert.user._id })
      .sort({ recordedAt: -1 })
      .limit(20);

    // Get nearby police stations and hospitals
    const lat = alert.location.coordinates.latitude;
    const lng = alert.location.coordinates.longitude;
    
    const nearbyServices = await Promise.all([
      mapService.getNearbyPlaces(lat, lng, 'police', 5000),
      mapService.getNearbyPlaces(lat, lng, 'hospital', 5000),
      mapService.getNearbyPlaces(lat, lng, 'embassy', 10000)
    ]);

    res.json({
      alert: alert.toObject(),
      locationHistory,
      nearbyServices: {
        police: nearbyServices[0] || [],
        medical: nearbyServices[1] || [],
        embassy: nearbyServices[2] || []
      }
    });

  } catch (error) {
    logger.error('Police alert detail error:', error);
    res.status(500).json({ error: 'Failed to fetch alert details' });
  }
});

// Acknowledge alert as police
router.post('/alerts/:alertId/acknowledge', policeAuth, [
  body('message').optional().isLength({ max: 500 }),
  body('estimatedArrival').optional().isISO8601()
], async (req, res) => {
  try {
    const { message = '', estimatedArrival } = req.body;
    
    const alert = await Alert.findById(req.params.alertId);
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    // Create police response
    const policeResponse = `Police responding. Officer: ${req.policeOfficer.name}, Badge: ${req.policeOfficer.badgeNumber}, Station: ${req.policeOfficer.station}`;
    const fullMessage = message ? `${policeResponse}. ${message}` : policeResponse;

    await alert.acknowledge(req.policeOfficer.id, 'police', fullMessage);

    // Add police-specific data
    alert.responses[alert.responses.length - 1].estimatedArrival = estimatedArrival;
    await alert.save();

    // Notify user and emergency contacts
    const user = await User.findById(alert.user);
    if (user) {
      // In real implementation, send SMS/notification to user
      logger.info(`Police acknowledged alert for user: ${user.email}`);
    }

    // Emit to real-time systems
    const io = req.app.get('io');
    if (io) {
      io.emit('police-response', {
        alertId: alert._id,
        officer: req.policeOfficer,
        message: fullMessage,
        estimatedArrival,
        timestamp: new Date()
      });
    }

    res.json({
      message: 'Alert acknowledged by police',
      officer: req.policeOfficer,
      acknowledgedAt: alert.acknowledgedAt
    });

  } catch (error) {
    logger.error('Police acknowledgment error:', error);
    res.status(500).json({ error: 'Failed to acknowledge alert' });
  }
});

// Update alert status
router.put('/alerts/:alertId/status', policeAuth, [
  body('status').isIn(['active', 'acknowledged', 'resolved', 'false_alarm']),
  body('message').optional().isLength({ max: 500 }),
  body('generateEFir').optional().isBoolean()
], async (req, res) => {
  try {
    const { status, message = '', generateEFir = false } = req.body;
    
    const alert = await Alert.findById(req.params.alertId);
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    const oldStatus = alert.status;
    alert.status = status;
    
    if (status === 'resolved') {
      alert.resolvedAt = new Date();
    }

    alert.responses.push({
      responderId: req.policeOfficer.id,
      responderType: 'police',
      action: status,
      message: message || `Status updated to ${status} by ${req.policeOfficer.name}`,
      timestamp: new Date()
    });

    await alert.save();

    // Generate E-FIR if requested and it's a serious incident
    let efirResult = null;
    if (generateEFir && ['sos', 'anomaly'].includes(alert.type) && alert.severity === 'emergency') {
      try {
        efirResult = await eFireService.generateEFIR(alert, req.policeOfficer);
        
        if (efirResult.success) {
          alert.efir = {
            generated: true,
            firNumber: efirResult.firNumber,
            policeStation: req.policeOfficer.station,
            officerInCharge: req.policeOfficer.name,
            generateAt: new Date(),
            status: 'filed'
          };
          await alert.save();
        }
      } catch (efirError) {
        logger.error('E-FIR generation error:', efirError);
      }
    }

    logger.info(`Alert ${alert._id} status updated from ${oldStatus} to ${status} by police`);

    res.json({
      message: 'Alert status updated successfully',
      alert: {
        id: alert._id,
        status: alert.status,
        resolvedAt: alert.resolvedAt
      },
      efir: efirResult
    });

  } catch (error) {
    logger.error('Police status update error:', error);
    res.status(500).json({ error: 'Failed to update alert status' });
  }
});

// Get users currently out of safe zones
router.get('/users/out-of-safe-zone', policeAuth, async (req, res) => {
  try {
    const { limit = 100 } = req.query;

    // Find recent location records where users are not in safe zones
    const recentLocations = await Location.find({
      'geoFencing.insideSafeZone': false,
      recordedAt: { $gte: new Date(Date.now() - 2 * 60 * 60 * 1000) } // Last 2 hours
    })
    .populate('user', 'firstName lastName phone nationality safetyScore')
    .sort({ recordedAt: -1 })
    .limit(parseInt(limit));

    // Group by user (get latest location for each user)
    const userLocationMap = new Map();
    recentLocations.forEach(location => {
      const userId = location.user._id.toString();
      if (!userLocationMap.has(userId)) {
        userLocationMap.set(userId, location);
      }
    });

    const usersOutOfSafeZone = Array.from(userLocationMap.values());

    res.json({
      users: usersOutOfSafeZone,
      count: usersOutOfSafeZone.length,
      timestamp: new Date()
    });

  } catch (error) {
    logger.error('Users out of safe zone error:', error);
    res.status(500).json({ error: 'Failed to fetch users out of safe zone' });
  }
});

// Get inactive users (for potential E-FIR generation)
router.get('/users/inactive', policeAuth, async (req, res) => {
  try {
    const { hours = 5 } = req.query;
    const inactiveThreshold = new Date(Date.now() - hours * 60 * 60 * 1000);

    const inactiveUsers = await User.find({
      lastActivity: { $lt: inactiveThreshold },
      isActive: true,
      inactiveAlertSent: false
    })
    .select('firstName lastName phone nationality passportNumber lastActivity currentLocation safetyScore')
    .limit(50);

    // Get latest locations for these users
    const usersWithLocations = await Promise.all(
      inactiveUsers.map(async (user) => {
        const latestLocation = await Location.findOne({ user: user._id })
          .sort({ recordedAt: -1 });
        
        return {
          ...user.toObject(),
          latestLocation: latestLocation ? {
            coordinates: latestLocation.coordinates,
            address: latestLocation.address,
            recordedAt: latestLocation.recordedAt
          } : null,
          inactiveHours: Math.round((Date.now() - user.lastActivity) / (1000 * 60 * 60))
        };
      })
    );

    res.json({
      inactiveUsers: usersWithLocations,
      count: usersWithLocations.length,
      thresholdHours: hours,
      timestamp: new Date()
    });

  } catch (error) {
    logger.error('Inactive users error:', error);
    res.status(500).json({ error: 'Failed to fetch inactive users' });
  }
});

// Generate E-FIR for inactive user
router.post('/users/:userId/generate-efir', policeAuth, [
  body('reason').notEmpty().isLength({ max: 500 }),
  body('lastKnownLocation').optional().isObject()
], async (req, res) => {
  try {
    const { reason, lastKnownLocation } = req.body;
    
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create an inactivity alert
    const alert = new Alert({
      user: user._id,
      type: 'inactivity',
      severity: 'critical',
      title: 'User Inactive - Potential Missing Person',
      message: `${user.fullName} has been inactive for over 5 hours. Last activity: ${user.lastActivity}`,
      location: lastKnownLocation ? {
        coordinates: lastKnownLocation.coordinates,
        address: lastKnownLocation.address,
        safetyStatus: 'danger'
      } : {
        coordinates: user.currentLocation || { latitude: 0, longitude: 0 },
        safetyStatus: 'unknown'
      },
      inactivityData: {
        lastActivity: user.lastActivity,
        inactiveDuration: Math.round((Date.now() - user.lastActivity) / (1000 * 60)),
        threshold: 300,
        locationStatic: true
      }
    });

    await alert.save();

    // Generate E-FIR
    const efirResult = await eFireService.generateEFIR(alert, req.policeOfficer, {
      reason: `Missing person report - ${reason}`,
      userInactive: true,
      inactiveHours: Math.round((Date.now() - user.lastActivity) / (1000 * 60 * 60))
    });

    if (efirResult.success) {
      alert.efir = {
        generated: true,
        firNumber: efirResult.firNumber,
        policeStation: req.policeOfficer.station,
        officerInCharge: req.policeOfficer.name,
        generateAt: new Date(),
        status: 'filed'
      };
      await alert.save();

      // Mark user as having alert sent
      user.inactiveAlertSent = true;
      await user.save();
    }

    logger.info(`E-FIR generated for inactive user: ${user.email}`);

    res.json({
      message: 'E-FIR generated successfully',
      efir: efirResult,
      alert: {
        id: alert._id,
        type: alert.type,
        severity: alert.severity,
        triggeredAt: alert.triggeredAt
      }
    });

  } catch (error) {
    logger.error('E-FIR generation error:', error);
    res.status(500).json({ error: 'Failed to generate E-FIR' });
  }
});

// Get police dashboard statistics
router.get('/dashboard/stats', policeAuth, async (req, res) => {
  try {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      activeAlerts,
      alertsLast24h,
      alertsLast7d,
      usersOutOfSafeZone,
      inactiveUsers,
      totalUsers,
      efirsGenerated
    ] = await Promise.all([
      Alert.countDocuments({ status: { $in: ['active', 'acknowledged', 'escalated'] } }),
      Alert.countDocuments({ triggeredAt: { $gte: last24Hours } }),
      Alert.countDocuments({ triggeredAt: { $gte: last7Days } }),
      Location.countDocuments({ 
        'geoFencing.insideSafeZone': false,
        recordedAt: { $gte: new Date(now.getTime() - 2 * 60 * 60 * 1000) }
      }),
      User.countDocuments({ 
        lastActivity: { $lt: new Date(now.getTime() - 5 * 60 * 60 * 1000) },
        isActive: true 
      }),
      User.countDocuments({}),
      Alert.countDocuments({ 'efir.generated': true })
    ]);

    const alertsByType = await Alert.aggregate([
      { $match: { triggeredAt: { $gte: last7Days } } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    const alertsBySeverity = await Alert.aggregate([
      { $match: { status: { $in: ['active', 'acknowledged', 'escalated'] } } },
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]);

    res.json({
      overview: {
        activeAlerts,
        alertsLast24h,
        alertsLast7d,
        usersOutOfSafeZone,
        inactiveUsers,
        totalUsers,
        efirsGenerated
      },
      breakdown: {
        alertsByType: alertsByType.map(item => ({
          type: item._id,
          count: item.count
        })),
        alertsBySeverity: alertsBySeverity.map(item => ({
          severity: item._id,
          count: item.count
        }))
      },
      timestamp: now
    });

  } catch (error) {
    logger.error('Police dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

module.exports = router;