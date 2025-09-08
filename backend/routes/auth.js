const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { BlockchainService } = require('../config/blockchain');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();
const blockchainService = new BlockchainService();

// Register new user
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty(),
  body('phone').isMobilePhone(),
  body('dateOfBirth').isDate(),
  body('nationality').trim().notEmpty(),
  body('passportNumber').trim().notEmpty()
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, firstName, lastName, phone, dateOfBirth, nationality, passportNumber } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { phone }, { passportNumber }] 
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: 'User already exists with this email, phone, or passport number' 
      });
    }

    // Generate blockchain wallet
    const wallet = blockchainService.generateWallet();

    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      phone,
      dateOfBirth,
      nationality,
      passportNumber,
      blockchainWallet: {
        address: wallet.address,
        privateKey: wallet.privateKey,
        identityHash: `${email}-${passportNumber}-${Date.now()}`
      }
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        safetyScore: user.safetyScore,
        blockchainWallet: {
          address: user.blockchainWallet.address,
          isVerified: user.blockchainWallet.isVerified
        }
      }
    });

  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login user
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last activity
    await user.updateActivity();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    logger.info(`User logged in: ${email}`);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        safetyScore: user.safetyScore,
        currentLocation: user.currentLocation,
        blockchainWallet: {
          address: user.blockchainWallet.address,
          isVerified: user.blockchainWallet.isVerified
        }
      }
    });

  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('emergencyContacts');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        avatar: user.avatar,
        dateOfBirth: user.dateOfBirth,
        nationality: user.nationality,
        safetyScore: user.safetyScore,
        riskProfile: user.riskProfile,
        currentLocation: user.currentLocation,
        emergencyContacts: user.emergencyContacts,
        currentTrip: user.currentTrip,
        preferences: user.preferences,
        blockchainWallet: {
          address: user.blockchainWallet.address,
          isVerified: user.blockchainWallet.isVerified,
          verificationDate: user.blockchainWallet.verificationDate
        }
      }
    });

  } catch (error) {
    logger.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile', auth, [
  body('firstName').optional().trim().notEmpty(),
  body('lastName').optional().trim().notEmpty(),
  body('phone').optional().isMobilePhone(),
  body('avatar').optional().isURL()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update allowed fields
    const allowedUpdates = ['firstName', 'lastName', 'phone', 'avatar', 'preferences'];
    const updates = {};
    
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    Object.assign(user, updates);
    await user.save();

    logger.info(`User profile updated: ${user.email}`);

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        avatar: user.avatar,
        safetyScore: user.safetyScore
      }
    });

  } catch (error) {
    logger.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Verify blockchain identity
router.post('/verify-identity', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Register identity on blockchain
    const identityHash = user.blockchainWallet.identityHash;
    
    try {
      await blockchainService.registerIdentity(identityHash);
      
      // Update user verification status
      user.blockchainWallet.isVerified = true;
      user.blockchainWallet.verificationDate = new Date();
      await user.save();

      logger.info(`Identity verified for user: ${user.email}`);

      res.json({
        message: 'Identity verified successfully',
        wallet: {
          address: user.blockchainWallet.address,
          isVerified: true,
          verificationDate: user.blockchainWallet.verificationDate
        }
      });

    } catch (blockchainError) {
      logger.error('Blockchain verification failed:', blockchainError);
      res.status(500).json({ error: 'Blockchain verification failed' });
    }

  } catch (error) {
    logger.error('Identity verification error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Logout (invalidate token - in a real app, you'd maintain a token blacklist)
router.post('/logout', auth, async (req, res) => {
  try {
    // Update user activity
    const user = await User.findById(req.userId);
    if (user) {
      user.lastActivity = new Date();
      await user.save();
      logger.info(`User logged out: ${user.email}`);
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Refresh token
router.post('/refresh', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate new token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.json({ token });
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

module.exports = router;