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
