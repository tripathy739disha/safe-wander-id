# Safe Wanderer - Tourist Guide & Safety App

## Project info

**URL**: https://lovable.dev/projects/d9363552-eea0-41a1-812e-d157cec578c0

## Backend Architecture

The backend is built with Node.js, Express, and MongoDB with the following structure:

```
backend/
├── config/
│   ├── database.js          # MongoDB connection configuration
│   ├── blockchain.js        # Ethereum Sepolia configuration
│   └── apis.js             # API keys and configurations
├── models/
│   ├── User.js             # User schema with blockchain wallet
│   ├── Location.js         # Location tracking schema
│   ├── Alert.js            # Alert and SOS schema
│   ├── SafeZone.js         # Safe zones schema
│   └── EmergencyContact.js # Emergency contacts schema
├── routes/
│   ├── auth.js             # Authentication routes
│   ├── location.js         # Location tracking and geo-fencing
│   ├── alerts.js           # Alert management and SOS
│   ├── police.js           # Police dashboard routes
│   └── blockchain.js       # Blockchain verification routes
├── services/
│   ├── smsService.js       # SMS gateway integration
│   ├── mapService.js       # MyMapIndia API integration
│   ├── blockchainService.js # Ethereum integration
│   ├── anomalyDetection.js # Gemini API anomaly detection
│   ├── anomalyML.js        # Custom ML model alternative
│   └── eFireService.js     # E-FIR generation (Python integration)
├── middleware/
│   ├── auth.js             # JWT authentication middleware
│   ├── geolocation.js      # Location validation middleware
│   └── rateLimit.js        # API rate limiting
├── utils/
│   ├── logger.js           # Logging utility
│   ├── validators.js       # Input validation
│   └── constants.js        # App constants
├── python/
│   └── efir_generator.py   # Python script for E-FIR generation
├── socket/
│   └── socketServer.js     # Real-time WebSocket server
├── package.json            # Backend dependencies
└── server.js              # Main server file
```

## Frontend Structure

```
src/
├── pages/
│   ├── police/            # Police Dashboard
│   │   ├── PoliceDashboard.tsx
│   │   ├── AlertsView.tsx
│   │   ├── UserTracking.tsx
│   │   └── EfirManagement.tsx
│   └── ... (existing tourist app pages)
└── ...
```

## Integration Guide: Frontend, Backend & Police Dashboard

### Prerequisites

Before starting, ensure you have:
- Node.js (v16 or higher)
- MongoDB (local instance or MongoDB Atlas)
- Python 3.8+ (for E-FIR generation)
- API Keys for:
  - MyMapIndia API
  - SMS Gateway (Twilio/TextLocal)
  - Gemini AI API (optional)
  - Ethereum Sepolia testnet access

### Environment Variables

Create the following environment files:

**Backend (.env in /backend folder):**
```bash
# Database
MONGODB_URI=mongodb://localhost:27017/safewandrer
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/safewandrer

# Server
PORT=5000
JWT_SECRET=your_jwt_secret_key_here

# API Keys
MYMAPINDIA_API_KEY=your_mymapindia_api_key
SMS_API_KEY=your_sms_gateway_key
SMS_API_SECRET=your_sms_gateway_secret
GEMINI_API_KEY=your_gemini_api_key

# Blockchain
ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/your_project_id
PRIVATE_KEY=your_ethereum_private_key
CONTRACT_ADDRESS=deployed_contract_address

# Police Dashboard
POLICE_API_KEY=secure_police_dashboard_key

# Python Integration
PYTHON_PATH=/usr/bin/python3
```

**Frontend (.env in root folder):**
```bash
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_MYMAPINDIA_API_KEY=your_mymapindia_api_key
```

### Step-by-Step Integration

#### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Install Python dependencies for E-FIR
pip install fpdf2 reportlab python-docx

# Start MongoDB (if local)
mongod

# Run the backend server
npm start
# or for development with auto-reload:
npm run dev
```

#### 2. Frontend Setup

```bash
# In the root directory
npm install

# Start the frontend development server
npm run dev
```

#### 3. Database Initialization

The backend will automatically:
- Connect to MongoDB on startup
- Create necessary collections
- Set up indexes for location-based queries

#### 4. Testing the Integration

**User Registration & Location Tracking:**
1. Open http://localhost:5173
2. Register a new user
3. Allow geolocation permissions
4. The app will start tracking location automatically

**SOS Alert Testing:**
1. Click the SOS button in the app
2. Check backend logs for SMS alerts
3. Verify alerts appear in police dashboard

**Police Dashboard Access:**
1. Navigate to http://localhost:5173/police/dashboard
2. View real-time alerts and user locations
3. Monitor safe zone violations

#### 5. API Integrations

**MyMapIndia Integration:**
- Location tracking uses MyMapIndia for geocoding
- Safe zones are mapped using MyMapIndia boundaries
- Route optimization for emergency services

**SMS Gateway:**
- Configured in `backend/services/smsService.js`
- Sends alerts to emergency contacts
- Police notifications for SOS events

**Blockchain Verification:**
- User identity verification on Ethereum Sepolia
- Immutable alert logging
- Smart contract interactions

#### 6. Real-time Features

**WebSocket Connection:**
```javascript
// Frontend connects to backend WebSocket
const socket = io('http://localhost:5000');

// Real-time location updates
socket.emit('locationUpdate', { userId, lat, lng });

// Police dashboard receives live alerts
socket.on('newAlert', (alertData) => {
  // Update dashboard UI
});
```

#### 7. Anomaly Detection

The system includes two anomaly detection methods:

**Option 1: Gemini AI (Cloud-based)**
- Uses Google's Gemini API
- Analyzes location patterns
- Triggers alerts for unusual movement

**Option 2: Custom ML Model (Local)**
- Python-based machine learning
- Trains on user location history
- Offline anomaly detection

#### 8. E-FIR Generation

**Automatic E-FIR Creation:**
- Triggered when user inactive >5 hours
- Python script generates PDF reports
- Integrates with police systems

### System Architecture Flow

```
User App (Frontend) 
    ↓ Location Data
Backend API Server
    ↓ Store Data
MongoDB Database
    ↓ Real-time Updates
Police Dashboard
    ↓ Alerts
SMS Gateway → Emergency Contacts
    ↓ Blockchain Verification
Ethereum Sepolia Network
```

### Running in Production

**Backend Deployment:**
1. Use PM2 for process management
2. Set up nginx reverse proxy
3. Configure SSL certificates
4. Monitor with logging services

**Frontend Deployment:**
1. Build production assets: `npm run build`
2. Deploy to CDN or static hosting
3. Update API URLs for production

**Database Security:**
- Enable MongoDB authentication
- Use encrypted connections
- Regular backups and monitoring

### Troubleshooting

**Common Issues:**
- **Location not updating:** Check geolocation permissions
- **SMS not sending:** Verify SMS API credentials
- **Police dashboard empty:** Ensure WebSocket connection
- **Blockchain errors:** Check Sepolia network status

### Support

For technical support:
1. Check backend logs in `/backend/logs/`
2. Monitor frontend console for errors
3. Verify API endpoints are accessible
4. Test database connections

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/d9363552-eea0-41a1-812e-d157cec578c0) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/d9363552-eea0-41a1-812e-d157cec578c0) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
