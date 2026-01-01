# Personal Inventory System - Setup Guide

This guide will walk you through setting up the Personal Inventory Management System from scratch.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Backend Setup](#backend-setup)
3. [Google Cloud Configuration](#google-cloud-configuration)
4. [Google OAuth Setup](#google-oauth-setup)
5. [Environment Variables](#environment-variables)
6. [Running the Application](#running-the-application)
7. [Testing the API](#testing-the-api)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** - [Download](https://git-scm.com/)
- **Google Cloud Account** - [Sign up](https://cloud.google.com/)

## Backend Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd personal-inventory
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

This will install all required packages including:
- Express (web framework)
- SQLite3 (database)
- JWT & Passport (authentication)
- Google Cloud Vision & Gemini (AI services)
- Multer (file uploads)
- And more...

### 3. Create Environment File

Copy the example environment file:

```bash
cp .env.example .env
```

## Google Cloud Configuration

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name (e.g., "personal-inventory")
4. Click "Create"

### Step 2: Enable Required APIs

1. In the Cloud Console, go to "APIs & Services" → "Library"
2. Search for and enable:
   - **Cloud Vision API**
   - **Vertex AI API** (for Gemini)

### Step 3: Create Service Account

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "Service Account"
3. Enter service account details:
   - Name: `inventory-ai-service`
   - Description: "Service account for AI features"
4. Click "Create and Continue"
5. Grant roles:
   - Cloud Vision API User
   - Vertex AI User
6. Click "Done"

### Step 4: Download Service Account Key

1. Click on the created service account
2. Go to "Keys" tab
3. Click "Add Key" → "Create new key"
4. Choose "JSON" format
5. Click "Create"
6. Save the downloaded JSON file to `backend/` directory
7. Rename it to something like `google-credentials.json`

### Step 5: Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Select your project
4. Copy the generated API key

## Google OAuth Setup

### Step 1: Create OAuth 2.0 Credentials

1. In Google Cloud Console, go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - User Type: External
   - App name: "Personal Inventory"
   - User support email: your email
   - Developer contact: your email
   - Save and continue through all steps

### Step 2: Configure OAuth Client

1. Application type: "Web application"
2. Name: "Personal Inventory Web Client"
3. Authorized JavaScript origins:
   - `http://localhost:5173` (frontend)
   - `http://localhost:5000` (backend)
4. Authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback`
5. Click "Create"
6. Copy the **Client ID** and **Client Secret**

## Environment Variables

Edit the `.env` file in the `backend` directory with your actual values:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration (generate a strong random string)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=24h

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_from_oauth_setup
GOOGLE_CLIENT_SECRET=your_google_client_secret_from_oauth_setup
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Google Cloud AI Configuration
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
GOOGLE_CLOUD_PROJECT_ID=your_project_id_from_google_cloud
GEMINI_API_KEY=your_gemini_api_key_from_ai_studio

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Session Secret (generate a strong random string)
SESSION_SECRET=your_super_secret_session_key_change_this_in_production

# Database
DATABASE_PATH=./database.db
```

### Generating Secure Secrets

For JWT_SECRET and SESSION_SECRET, generate random strings:

```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Running the Application

### 1. Initialize the Database

The database will be automatically created when you first start the server.

### 2. Start the Backend Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

You should see:
```
Connected to SQLite database
Database tables initialized successfully
Google Cloud Vision API initialized
Google Gemini API initialized
Server running on port 5000
Environment: development
Frontend URL: http://localhost:5173
```

### 3. Verify the Server

Open your browser and go to:
```
http://localhost:5000/health
```

You should see:
```json
{
  "status": "ok",
  "message": "Personal Inventory API is running"
}
```

## Testing the API

### Using cURL

#### 1. Register a User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### 2. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Save the returned `token` for authenticated requests.

#### 3. Create a Category (Authenticated)

```bash
curl -X POST http://localhost:5000/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Electronics",
    "description": "Electronic devices and accessories"
  }'
```

#### 4. Create an Item (Authenticated)

```bash
curl -X POST http://localhost:5000/api/items \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "name=Laptop" \
  -F "description=MacBook Pro 2023" \
  -F "quantity=1" \
  -F "category_id=1"
```

### Using Postman

1. Import the API endpoints
2. Set up an environment variable for the token
3. Test each endpoint systematically

### Using Thunder Client (VS Code Extension)

1. Install Thunder Client extension
2. Create a new collection
3. Add requests for each endpoint
4. Use environment variables for base URL and token

## Troubleshooting

### Database Issues

**Problem**: Database file not created
```bash
# Solution: Ensure write permissions
chmod 755 backend/
```

**Problem**: Database locked
```bash
# Solution: Close any other connections and restart
rm backend/database.db
npm run dev
```

### Google Cloud Issues

**Problem**: Vision API not working
```bash
# Check credentials file path
ls -la backend/google-credentials.json

# Verify environment variable
echo $GOOGLE_APPLICATION_CREDENTIALS
```

**Problem**: Gemini API errors
- Verify API key is correct
- Check if Vertex AI API is enabled
- Ensure billing is enabled on your project

### Authentication Issues

**Problem**: JWT token expired
- Tokens expire after 24 hours by default
- Login again to get a new token

**Problem**: Google OAuth not working
- Verify redirect URI matches exactly
- Check if OAuth consent screen is configured
- Ensure client ID and secret are correct

### Port Already in Use

```bash
# Find process using port 5000
lsof -i :5000  # Mac/Linux
netstat -ano | findstr :5000  # Windows

# Kill the process or change PORT in .env
```

### Module Not Found Errors

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Optional: Barcode Database APIs

For enhanced barcode lookup, you can add API keys for:

### UPC Item DB
1. Sign up at [UPCitemdb.com](https://www.upcitemdb.com/)
2. Get your API key
3. Add to `.env`:
```env
UPCITEMDB_API_KEY=your_api_key_here
```

### Barcode Lookup
1. Sign up at [BarcodeLookup.com](https://www.barcodelookup.com/)
2. Get your API key
3. Add to `.env`:
```env
BARCODE_LOOKUP_API_KEY=your_api_key_here
```

## Next Steps

1. ✅ Backend is now running
2. 🚧 Frontend setup (coming soon)
3. 📱 Mobile app (future)

## Support

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review the logs in the terminal
3. Open an issue on GitHub
4. Check Google Cloud Console for API errors

## Security Notes

⚠️ **Important for Production:**

1. Change all default secrets
2. Use HTTPS
3. Enable rate limiting
4. Set up proper CORS
5. Use environment-specific configs
6. Enable Google Cloud API quotas
7. Set up monitoring and alerts
8. Regular security updates

---

**Setup Complete!** 🎉

Your Personal Inventory backend is now ready to use. Proceed to test the API endpoints or wait for the frontend implementation.