const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { BlockchainService } = require('../config/blockchain');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();
const blockchainService = new BlockchainService();

// Register identity on blockchain
router.post('/register-identity', auth, [
  body('identityData').isObject(),
  body('documentHash').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { identityData, documentHash } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.blockchainWallet.isVerified) {
      return res.status(400).json({ error: 'Identity already verified on blockchain' });
    }

    // Create identity hash from user data and document hash
    const identityString = JSON.stringify({
      email: user.email,
      passportNumber: user.passportNumber,
      nationality: user.nationality,
      firstName: user.firstName,
      lastName: user.lastName,
      documentHash: documentHash || '',
      timestamp: Date.now()
    });

    const crypto = require('crypto');
    const identityHash = crypto.createHash('sha256').update(identityString).digest('hex');

    try {
      // Register on Ethereum Sepolia blockchain
      const txReceipt = await blockchainService.registerIdentity(identityHash);

      // Update user's blockchain data
      user.blockchainWallet.identityHash = identityHash;
      user.blockchainWallet.isVerified = true;
      user.blockchainWallet.verificationDate = new Date();
      
      await user.save();

      logger.info(`Identity registered on blockchain for user: ${user.email}, TX: ${txReceipt.transactionHash}`);

      res.json({
        message: 'Identity registered on blockchain successfully',
        blockchain: {
          identityHash,
          transactionHash: txReceipt.transactionHash,
          blockNumber: txReceipt.blockNumber,
          gasUsed: txReceipt.gasUsed.toString(),
          network: 'sepolia'
        },
        wallet: {
          address: user.blockchainWallet.address,
          isVerified: true,
          verificationDate: user.blockchainWallet.verificationDate
        }
      });

    } catch (blockchainError) {
      logger.error('Blockchain registration failed:', blockchainError);
      res.status(500).json({ 
        error: 'Blockchain registration failed',
        details: blockchainError.message 
      });
    }

  } catch (error) {
    logger.error('Identity registration error:', error);
    res.status(500).json({ error: 'Failed to register identity' });
  }
});

// Verify identity on blockchain
router.post('/verify-identity', auth, [
  body('userAddress').optional().isEthereumAddress()
], async (req, res) => {
  try {
    const { userAddress } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const addressToVerify = userAddress || user.blockchainWallet.address;
    const identityHash = user.blockchainWallet.identityHash;

    if (!identityHash) {
      return res.status(400).json({ error: 'No identity hash found. Please register identity first.' });
    }

    try {
      // Verify on blockchain
      const isVerified = await blockchainService.verifyIdentity(addressToVerify, identityHash);
      const identityStatus = await blockchainService.getIdentityStatus(addressToVerify);

      res.json({
        verified: isVerified,
        identityStatus,
        blockchain: {
          address: addressToVerify,
          identityHash,
          network: 'sepolia'
        },
        user: {
          id: user._id,
          name: user.fullName,
          isBlockchainVerified: user.blockchainWallet.isVerified
        }
      });

    } catch (blockchainError) {
      logger.error('Blockchain verification failed:', blockchainError);
      res.status(500).json({ 
        error: 'Blockchain verification failed',
        details: blockchainError.message 
      });
    }

  } catch (error) {
    logger.error('Identity verification error:', error);
    res.status(500).json({ error: 'Failed to verify identity' });
  }
});

// Get wallet balance
router.get('/wallet/balance', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user || !user.blockchainWallet.address) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    try {
      const balance = await blockchainService.getBalance(user.blockchainWallet.address);

      res.json({
        wallet: {
          address: user.blockchainWallet.address,
          balance: balance,
          currency: 'ETH',
          network: 'sepolia'
        }
      });

    } catch (blockchainError) {
      logger.error('Balance fetch failed:', blockchainError);
      res.status(500).json({ 
        error: 'Failed to fetch balance',
        details: blockchainError.message 
      });
    }

  } catch (error) {
    logger.error('Wallet balance error:', error);
    res.status(500).json({ error: 'Failed to get wallet balance' });
  }
});

// Get identity status
router.get('/identity/status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let blockchainStatus = null;
    
    if (user.blockchainWallet.address) {
      try {
        const status = await blockchainService.getIdentityStatus(user.blockchainWallet.address);
        blockchainStatus = status;
      } catch (blockchainError) {
        logger.warn('Failed to fetch blockchain status:', blockchainError.message);
      }
    }

    res.json({
      identity: {
        isRegistered: !!user.blockchainWallet.identityHash,
        isVerified: user.blockchainWallet.isVerified,
        verificationDate: user.blockchainWallet.verificationDate,
        blockchainStatus
      },
      wallet: {
        address: user.blockchainWallet.address,
        hasPrivateKey: !!user.blockchainWallet.privateKey
      },
      user: {
        id: user._id,
        name: user.fullName,
        email: user.email,
        nationality: user.nationality,
        passportNumber: user.passportNumber
      }
    });

  } catch (error) {
    logger.error('Identity status error:', error);
    res.status(500).json({ error: 'Failed to get identity status' });
  }
});

// Generate new wallet (if needed)
router.post('/wallet/generate', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.blockchainWallet.address) {
      return res.status(400).json({ error: 'Wallet already exists' });
    }

    // Generate new wallet
    const wallet = blockchainService.generateWallet();

    // Update user with new wallet
    user.blockchainWallet.address = wallet.address;
    user.blockchainWallet.privateKey = wallet.privateKey;
    user.blockchainWallet.isVerified = false;
    
    await user.save();

    logger.info(`New wallet generated for user: ${user.email}`);

    res.json({
      message: 'New wallet generated successfully',
      wallet: {
        address: wallet.address,
        mnemonic: wallet.mnemonic // Return mnemonic only once for backup
      },
      warning: 'Please save your mnemonic phrase securely. This is the only time it will be shown.'
    });

  } catch (error) {
    logger.error('Wallet generation error:', error);
    res.status(500).json({ error: 'Failed to generate wallet' });
  }
});

// Verify third-party identity (for police/authorities)
router.post('/verify-third-party', [
  body('userAddress').isEthereumAddress(),
  body('apiKey').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userAddress, apiKey } = req.body;

    // Verify API key (simplified - in production, implement proper API key management)
    if (apiKey !== process.env.THIRD_PARTY_API_KEY) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    try {
      // Find user by wallet address
      const user = await User.findOne({ 'blockchainWallet.address': userAddress })
        .select('firstName lastName nationality passportNumber blockchainWallet');

      if (!user) {
        return res.status(404).json({ error: 'User not found with this wallet address' });
      }

      // Verify on blockchain
      const isVerified = await blockchainService.verifyIdentity(
        userAddress, 
        user.blockchainWallet.identityHash
      );

      if (isVerified) {
        res.json({
          verified: true,
          user: {
            name: user.fullName,
            nationality: user.nationality,
            passportNumber: user.passportNumber, // Only for authorized parties
            verificationDate: user.blockchainWallet.verificationDate
          },
          blockchain: {
            address: userAddress,
            network: 'sepolia',
            verifiedOnChain: true
          }
        });
      } else {
        res.json({
          verified: false,
          message: 'Identity not verified on blockchain'
        });
      }

    } catch (blockchainError) {
      logger.error('Third-party verification failed:', blockchainError);
      res.status(500).json({ 
        error: 'Blockchain verification failed',
        details: blockchainError.message 
      });
    }

  } catch (error) {
    logger.error('Third-party verification error:', error);
    res.status(500).json({ error: 'Failed to verify third-party identity' });
  }
});

module.exports = router;