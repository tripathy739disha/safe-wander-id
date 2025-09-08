const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Alert = require('../models/Alert');
const EmergencyContact = require('../models/EmergencyContact');
const auth = require('../middleware/auth');
const smsService = require('../services/smsService');
const logger = require('../utils/logger');
const { API_CONFIG } = require('../config/apis');

const router = express.Router();

// Trigger SOS alert
router.post('/sos', auth, [
  body('latitude').isFloat({ min: -90, max: 90 }),
  body('longitude').isFloat({ min: -180, max: 180 }),
  body('message').optional().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { latitude, longitude, message = '', autoTriggered = false } = req.body;
    const user = await User.findById(req.userId).populate('emergencyContacts');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check for recent SOS alerts to prevent spam
    const recentSOS = await Alert.findOne({
      user: req.userId,
      type: 'sos',
      triggeredAt: { $gte: new Date(Date.now() - API_CONFIG.RATE_LIMITS.SOS_COOLDOWN) }
    });

    if (recentSOS && !autoTriggered) {
      return res.status(429).json({ 
        error: 'Please wait before sending another SOS alert',
        nextAllowedTime: new Date(recentSOS.triggeredAt.getTime() + API_CONFIG.RATE_LIMITS.SOS_COOLDOWN)
      });
    }

    // Create SOS alert
    const alert = new Alert({
      user: req.userId,
      type: 'sos',
      severity: 'emergency',
      title: 'SOS Alert Triggered',
      message: message || `Emergency assistance requested by ${user.firstName} ${user.lastName}`,
      location: {
        coordinates: { latitude, longitude },
        safetyStatus: 'danger'
      },
      sosData: {
        countdown: user.preferences.safety.sosTimeout || 10,
        autoTriggered,
        cancelled: false
      },
      escalation: {
        level: 0,
        autoEscalation: true,
        escalationTimeout: 15
      }
    });

    await alert.save();

    // Get emergency contacts
    const emergencyContacts = await EmergencyContact.find({
      user: req.userId,
      status: 'active'
    }).sort({ priority: -1 });

    // Send immediate alerts to emergency contacts and authorities
    const alertPromises = [];

    // Alert emergency contacts
    for (const contact of emergencyContacts.slice(0, 5)) { // Limit to top 5 contacts
      if (contact.alertSettings.sosAlerts) {
        alertPromises.push(sendSOSAlert(contact, user, alert, latitude, longitude));
      }
    }

    // Alert police dashboard
    alertPromises.push(alertPoliceDashboard(user, alert, latitude, longitude));

    // Execute all alerts in parallel
    await Promise.allSettled(alertPromises);

    // Schedule auto-escalation
    setTimeout(async () => {
      await autoEscalateAlert(alert._id);
    }, (alert.escalation.escalationTimeout || 15) * 60 * 1000);

    // Emit real-time SOS alert
    const io = req.app.get('io');
    if (io) {
      io.emit('sos-alert', {
        userId: req.userId,
        alert: alert,
        user: {
          name: user.fullName,
          phone: user.phone
        },
        location: { latitude, longitude }
      });

      // Emit to police dashboard specifically
      io.to('police-dashboard').emit('new-sos-alert', {
        alertId: alert._id,
        user: {
          id: user._id,
          name: user.fullName,
          phone: user.phone,
          safetyScore: user.safetyScore
        },
        location: { latitude, longitude },
        timestamp: alert.triggeredAt
      });
    }

    logger.info(`SOS alert triggered by user: ${user.email} at ${latitude}, ${longitude}`);

    res.status(201).json({
      message: 'SOS alert sent successfully',
      alert: {
        id: alert._id,
        type: alert.type,
        severity: alert.severity,
        triggeredAt: alert.triggeredAt,
        location: alert.location.coordinates
      },
      contactsAlerted: emergencyContacts.length,
      autoEscalationIn: alert.escalation.escalationTimeout
    });

  } catch (error) {
    logger.error('SOS alert error:', error);
    res.status(500).json({ error: 'Failed to send SOS alert' });
  }
});

// Cancel SOS alert
router.post('/sos/:alertId/cancel', auth, async (req, res) => {
  try {
    const alert = await Alert.findOne({
      _id: req.params.alertId,
      user: req.userId,
      type: 'sos',
      status: { $in: ['active', 'acknowledged'] }
    });

    if (!alert) {
      return res.status(404).json({ error: 'SOS alert not found or already resolved' });
    }

    // Cancel the alert
    alert.sosData.cancelled = true;
    alert.sosData.cancelledAt = new Date();
    alert.status = 'resolved';
    alert.resolvedAt = new Date();

    alert.responses.push({
      responderType: 'user',
      action: 'cancelled',
      message: 'SOS alert cancelled by user',
      timestamp: new Date()
    });

    await alert.save();

    // Notify all parties about cancellation
    const user = await User.findById(req.userId);
    const emergencyContacts = await EmergencyContact.find({
      user: req.userId,
      status: 'active'
    });

    // Send cancellation messages
    const cancellationPromises = emergencyContacts.map(contact => 
      sendSOSCancellation(contact, user, alert)
    );

    await Promise.allSettled(cancellationPromises);

    // Emit cancellation to police dashboard
    const io = req.app.get('io');
    if (io) {
      io.to('police-dashboard').emit('sos-cancelled', {
        alertId: alert._id,
        userId: req.userId,
        cancelledAt: new Date()
      });
    }

    logger.info(`SOS alert cancelled by user: ${user.email}`);

    res.json({
      message: 'SOS alert cancelled successfully',
      alert: {
        id: alert._id,
        status: alert.status,
        cancelledAt: alert.sosData.cancelledAt
      }
    });

  } catch (error) {
    logger.error('SOS cancellation error:', error);
    res.status(500).json({ error: 'Failed to cancel SOS alert' });
  }
});

// Get user alerts
router.get('/', auth, async (req, res) => {
  try {
    const { status, type, limit = 20, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const query = { user: req.userId };
    if (status) query.status = status;
    if (type) query.type = type;

    const alerts = await Alert.find(query)
      .sort({ triggeredAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Alert.countDocuments(query);

    res.json({
      alerts,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: alerts.length,
        totalRecords: total
      }
    });

  } catch (error) {
    logger.error('Get alerts error:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Acknowledge alert
router.post('/:alertId/acknowledge', auth, async (req, res) => {
  try {
    const { message = '' } = req.body;
    const alert = await Alert.findOne({
      _id: req.params.alertId,
      user: req.userId,
      status: 'active'
    });

    if (!alert) {
      return res.status(404).json({ error: 'Alert not found or already acknowledged' });
    }

    await alert.acknowledge(req.userId, 'user', message);

    res.json({
      message: 'Alert acknowledged successfully',
      alert: {
        id: alert._id,
        status: alert.status,
        acknowledgedAt: alert.acknowledgedAt
      }
    });

  } catch (error) {
    logger.error('Alert acknowledgment error:', error);
    res.status(500).json({ error: 'Failed to acknowledge alert' });
  }
});

// Get active alerts count
router.get('/active/count', auth, async (req, res) => {
  try {
    const count = await Alert.countDocuments({
      user: req.userId,
      status: { $in: ['active', 'acknowledged', 'escalated'] }
    });

    res.json({ activeAlerts: count });

  } catch (error) {
    logger.error('Active alerts count error:', error);
    res.status(500).json({ error: 'Failed to get active alerts count' });
  }
});

// Helper functions
async function sendSOSAlert(contact, user, alert, latitude, longitude) {
  try {
    const message = `🚨 EMERGENCY: ${user.fullName} has triggered an SOS alert. Location: https://maps.google.com/maps?q=${latitude},${longitude} Time: ${new Date().toLocaleString()} Please respond or call them immediately at ${user.phone}`;

    const result = await smsService.sendSMS(contact.phone.primary, message);
    
    // Record communication
    await contact.recordCommunication('sms', alert._id, message, result.success ? 'sent' : 'failed');

    logger.info(`SOS alert sent to ${contact.name}: ${result.success ? 'Success' : 'Failed'}`);
    return result;
  } catch (error) {
    logger.error(`Failed to send SOS alert to ${contact.name}:`, error);
    return { success: false, error: error.message };
  }
}

async function sendSOSCancellation(contact, user, alert) {
  try {
    const message = `✅ SAFE: ${user.fullName} has cancelled their SOS alert. They are now safe. Original alert time: ${alert.triggeredAt.toLocaleString()}`;

    const result = await smsService.sendSMS(contact.phone.primary, message);
    
    // Record communication
    await contact.recordCommunication('sms', alert._id, message, result.success ? 'sent' : 'failed');

    return result;
  } catch (error) {
    logger.error(`Failed to send SOS cancellation to ${contact.name}:`, error);
    return { success: false, error: error.message };
  }
}

async function alertPoliceDashboard(user, alert, latitude, longitude) {
  try {
    // This would integrate with actual police system APIs
    // For now, we'll just log and emit via WebSocket
    
    const policeAlert = {
      alertId: alert._id,
      type: 'sos',
      severity: 'emergency',
      user: {
        id: user._id,
        name: user.fullName,
        phone: user.phone,
        nationality: user.nationality,
        passportNumber: user.passportNumber
      },
      location: {
        latitude,
        longitude,
        timestamp: new Date()
      },
      triggeredAt: alert.triggeredAt
    };

    // In a real implementation, this would call police API
    logger.info('Police dashboard alerted:', policeAlert);
    
    return { success: true, policeAlert };
  } catch (error) {
    logger.error('Failed to alert police dashboard:', error);
    return { success: false, error: error.message };
  }
}

async function autoEscalateAlert(alertId) {
  try {
    const alert = await Alert.findById(alertId);
    
    if (!alert || alert.status === 'resolved' || alert.sosData.cancelled) {
      return; // Alert resolved or cancelled
    }

    // Check if alert has been acknowledged
    if (alert.status === 'active') {
      await alert.escalate('No response received within escalation timeout');
      
      // Additional escalation actions here
      // - Alert more emergency contacts
      // - Contact local authorities
      // - Generate E-FIR if needed
      
      logger.info(`Alert auto-escalated: ${alertId}`);
    }
  } catch (error) {
    logger.error('Auto-escalation error:', error);
  }
}

module.exports = router;