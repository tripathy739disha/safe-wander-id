const { ethers } = require('ethers');
const logger = require('../utils/logger');

// Ethereum Sepolia Testnet Configuration
const BLOCKCHAIN_CONFIG = {
  NETWORK: 'sepolia',
  RPC_URL: process.env.ETHEREUM_RPC_URL || 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
  CHAIN_ID: 11155111,
  CONTRACT_ADDRESS: process.env.IDENTITY_CONTRACT_ADDRESS || '0x1234567890123456789012345678901234567890',
  PRIVATE_KEY: process.env.BLOCKCHAIN_PRIVATE_KEY,
};

// Smart Contract ABI for Digital Identity Verification
const IDENTITY_CONTRACT_ABI = [
  "function verifyIdentity(address user, string memory identityHash) public view returns (bool)",
  "function registerIdentity(string memory identityHash) public",
  "function getIdentityStatus(address user) public view returns (uint256)",
  "event IdentityRegistered(address indexed user, string identityHash)",
  "event IdentityVerified(address indexed user, bool status)"
];

class BlockchainService {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(BLOCKCHAIN_CONFIG.RPC_URL);
    this.wallet = BLOCKCHAIN_CONFIG.PRIVATE_KEY 
      ? new ethers.Wallet(BLOCKCHAIN_CONFIG.PRIVATE_KEY, this.provider)
      : null;
    this.contract = null;
    this.initializeContract();
  }

  async initializeContract() {
    try {
      if (this.wallet) {
        this.contract = new ethers.Contract(
          BLOCKCHAIN_CONFIG.CONTRACT_ADDRESS,
          IDENTITY_CONTRACT_ABI,
          this.wallet
        );
        logger.info('Blockchain service initialized successfully');
      }
    } catch (error) {
      logger.error('Failed to initialize blockchain service:', error);
    }
  }

  async verifyIdentity(userAddress, identityHash) {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }
      
      const isVerified = await this.contract.verifyIdentity(userAddress, identityHash);
      logger.info(`Identity verification result for ${userAddress}: ${isVerified}`);
      return isVerified;
    } catch (error) {
      logger.error('Identity verification failed:', error);
      return false;
    }
  }

  async registerIdentity(identityHash) {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const tx = await this.contract.registerIdentity(identityHash);
      const receipt = await tx.wait();
      
      logger.info(`Identity registered successfully. TX: ${receipt.transactionHash}`);
      return receipt;
    } catch (error) {
      logger.error('Identity registration failed:', error);
      throw error;
    }
  }

  async getIdentityStatus(userAddress) {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const status = await this.contract.getIdentityStatus(userAddress);
      return status.toString();
    } catch (error) {
      logger.error('Failed to get identity status:', error);
      return '0';
    }
  }

  generateWallet() {
    const wallet = ethers.Wallet.createRandom();
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: wallet.mnemonic.phrase
    };
  }

  async getBalance(address) {
    try {
      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      logger.error('Failed to get balance:', error);
      return '0';
    }
  }
}

module.exports = { BlockchainService, BLOCKCHAIN_CONFIG };