const twilio = require('twilio');
const { API_CONFIG } = require('../config/apis');
const logger = require('../utils/logger');

const client = twilio(API_CONFIG.SMS_GATEWAY.TWILIO.ACCOUNT_SID, API_CONFIG.SMS_GATEWAY.TWILIO.AUTH_TOKEN);

const sendSMS = async (to, message) => {
  try {
    const result = await client.messages.create({
      body: message,
      from: API_CONFIG.SMS_GATEWAY.TWILIO.PHONE_NUMBER,
      to: to
    });
    
    logger.info(`SMS sent successfully: ${result.sid}`);
    return { success: true, messageId: result.sid };
  } catch (error) {
    logger.error('SMS sending failed:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendSMS };