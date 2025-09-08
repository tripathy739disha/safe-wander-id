const { GoogleGenerativeAI } = require('@google/generative-ai');
const { API_CONFIG } = require('../config/apis');
const logger = require('../utils/logger');

const genAI = new GoogleGenerativeAI(API_CONFIG.GEMINI_AI.API_KEY);

const detectAnomaly = async (data) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `Analyze this tourist location data for anomalies:
    Current Location: ${data.currentLocation.latitude}, ${data.currentLocation.longitude}
    Recent Locations: ${JSON.stringify(data.recentLocations)}
    Movement Speed: ${data.movement.averageSpeed} km/h
    User Safety Score: ${data.userProfile.safetyScore}
    
    Detect if this indicates: 1) Distress 2) Unusual movement 3) Dangerous location
    Return JSON: {"isAnomaly": boolean, "confidence": 0-1, "reasons": []}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysis = JSON.parse(response.text());
    
    return {
      isAnomaly: analysis.isAnomaly || false,
      confidence: analysis.confidence || 0,
      reasons: analysis.reasons || [],
      modelVersion: 'gemini-pro'
    };
  } catch (error) {
    logger.error('Gemini anomaly detection failed:', error);
    return { isAnomaly: false, confidence: 0, reasons: ['Detection failed'] };
  }
};

module.exports = { detectAnomaly };