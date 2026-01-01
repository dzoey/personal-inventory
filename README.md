# Personal Inventory Management System

An AI-powered full-stack personal inventory management application with dual authentication (JWT + Google OAuth), barcode scanning, hierarchical location/container management, and intelligent item identification using Google Cloud Vision and Gemini AI.

## 🌟 Features

### Authentication
- ✅ Email/password registration and login (JWT)
- ✅ Google OAuth 2.0 Sign-In
- ✅ Unified authentication system supporting both methods
- ✅ Secure password hashing with bcrypt
- ✅ Protected routes and API endpoints

### Core Inventory Management
- ✅ CRUD operations for inventory items
- ✅ Category management
- ✅ Hierarchical location management (locations can contain other locations)
- ✅ Container management (containers can be nested and assigned to locations)
- ✅ Search and filter functionality
- ✅ Image upload for items, containers, and locations

### AI-Powered Features
- 🤖 **Item Identification**: Upload image or provide text description to identify items
- 🤖 **Smart Placement**: AI suggests optimal storage location based on item characteristics
- 🤖 **Natural Language Queries**: Ask questions like "what is this item?" or "where does this belong?"
- 🤖 **Visual Search**: Find items by uploading similar images
- 🤖 **Barcode Integration**: Combine barcode data with AI for enhanced identification

### Barcode Features
- 📱 **Item Registration**: Scan barcode to auto-populate item details
- 📱 **Location Lookup**: Scan barcode to find where item should be stored
- 📱 **Product Database**: Lookup product information from barcode
- 📱 **Camera-based**: Use device camera for scanning
- 📱 **Manual Entry**: Option to manually enter barcode if camera unavailable

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js with Express
- **Database**: SQLite3
- **Authentication**: 
  - JWT (JSON Web Tokens) with bcrypt
  - Google OAuth 2.0 with Passport.js
- **File Upload**: Multer
- **AI Services**: 
  - Google Cloud Vision API (image analysis, barcode detection)
  - Google Gemini API (multimodal queries, natural language)
- **Barcode**: QuaggaJS (barcode scanning and decoding)

### Frontend (To Be Implemented)
- **Framework**: React with Vite
- **HTTP Client**: Axios
- **State Management**: React Query
- **Routing**: React Router DOM
- **Authentication**: @react-oauth/google
- **Barcode Scanning**: QuaggaJS (camera-based)
- **Styling**: TailwindCSS or Material-UI

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Google Cloud account (for AI features)
- Google OAuth credentials (for Google Sign-In)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd personal-inventory
```

### 2. Backend Setup

```bash
cd backend
npm install
```

### 3. Environment Configuration

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_jwt_secret_here_change_in_production
JWT_EXPIRE=24h

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Google Cloud AI Configuration
GOOGLE_APPLICATION_CREDENTIALS=./path/to/service-account-key.json
GOOGLE_CLOUD_PROJECT_ID=your_project_id_here
GEMINI_API_KEY=your_gemini_api_key_here

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Session Secret
SESSION_SECRET=your_session_secret_here_change_in_production

# Database
DATABASE_PATH=./database.db
```

### 4. Google Cloud Setup

1. Create a Google Cloud Project
2. Enable APIs:
   - Cloud Vision API
   - Gemini API (Vertex AI)
3. Create OAuth 2.0 credentials:
   - Add authorized redirect URIs
   - Download Client ID and Secret
4. Create service account for Vision/Gemini
5. Download credentials JSON file

### 5. Start the Backend Server

```bash
npm run dev
```

The backend will run on `http://localhost:5000`

## 📁 Project Structure

```
personal-inventory/
├── backend/
│   ├── config/
│   │   ├── database.js          # Database configuration and schema
│   │   └── passport.js          # Passport authentication strategies
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── itemsController.js   # Items CRUD operations
│   │   ├── categoriesController.js
│   │   ├── locationsController.js
│   │   ├── containersController.js
│   │   ├── aiController.js      # AI-powered features
│   │   └── barcodeController.js # Barcode operations
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication middleware
│   │   └── upload.js            # File upload middleware
│   ├── routes/
│   │   ├── auth.js
│   │   ├── items.js
│   │   ├── categories.js
│   │   ├── locations.js
│   │   ├── containers.js
│   │   ├── ai.js
│   │   └── barcode.js
│   ├── services/
│   │   ├── visionService.js     # Google Cloud Vision integration
│   │   ├── geminiService.js     # Google Gemini AI integration
│   │   └── barcodeService.js    # Barcode lookup and validation
│   ├── uploads/                 # Uploaded images
│   ├── database.db              # SQLite database
│   ├── server.js                # Express server
│   ├── package.json
│   └── .env
├── frontend/                    # (To be implemented)
├── README.md
└── PLAN.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Items
- `GET /api/items` - List all items (with search/filter)
- `GET /api/items/:id` - Get single item
- `POST /api/items` - Create item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item
- `GET /api/items/barcode/:barcode` - Find item by barcode

### Categories
- `GET /api/categories` - List all categories
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Locations
- `GET /api/locations` - List all locations (tree structure)
- `GET /api/locations/:id` - Get single location
- `POST /api/locations` - Create location
- `PUT /api/locations/:id` - Update location
- `DELETE /api/locations/:id` - Delete location

### Containers
- `GET /api/containers` - List all containers
- `GET /api/containers/:id` - Get single container
- `POST /api/containers` - Create container
- `PUT /api/containers/:id` - Update container
- `DELETE /api/containers/:id` - Delete container
- `GET /api/containers/barcode/:barcode` - Find container by barcode

### AI Services
- `POST /api/ai/identify-item` - Identify item from image/text/barcode
- `POST /api/ai/suggest-placement` - Suggest optimal storage location
- `POST /api/ai/query` - Natural language query processing
- `POST /api/ai/analyze-image` - Analyze image only

### Barcode Services
- `POST /api/barcode/scan` - Scan barcode from image
- `GET /api/barcode/lookup/:barcode` - Lookup product info
- `POST /api/barcode/register` - Register item via barcode
- `GET /api/barcode/find/:barcode` - Find item location by barcode
- `POST /api/barcode/validate` - Validate barcode format

## 🗄️ Database Schema

### Users
- Supports both local and Google OAuth authentication
- Stores profile information and authentication provider

### Items
- Core inventory items with optional barcode
- Can be assigned to categories, containers, or locations
- Supports AI identification with confidence scores

### Categories
- User-defined categories for organizing items

### Locations (Hierarchical)
- Can contain other locations (nested structure)
- Can contain containers and items

### Containers (Nested)
- Can contain other containers
- Can be assigned to locations
- Support barcode identification

## 🔒 Security Features

- ✅ Passwords hashed with bcrypt (10 rounds)
- ✅ JWT tokens with expiration (24 hours)
- ✅ Protected routes require authentication
- ✅ User data isolation (users only see their own data)
- ✅ Input validation and sanitization
- ✅ Secure OAuth flow with state parameter
- ✅ Environment variables for sensitive data

## 💰 Cost Considerations

### Google Cloud APIs
- **Cloud Vision API**: ~$1.50 per 1,000 images
- **Gemini API**: Varies by model and usage
- **Free Tier**: Available for development/testing

### Optimization Strategies
- Request caching
- Rate limiting per user
- Batch processing where possible
- Use lower-cost models for simple queries
- Cache barcode lookups

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Install dependencies (includes test dependencies)
npm install

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run with coverage report
npm test -- --coverage
```

### Test Suites

- ✅ **Authentication Tests**: Registration, login, token validation
- ✅ **Items API Tests**: CRUD operations, search, filtering
- ✅ **Barcode Service Tests**: Validation, parsing, check digits
- 🚧 **Categories API Tests**: Coming soon
- 🚧 **Locations API Tests**: Coming soon
- 🚧 **Containers API Tests**: Coming soon

### Coverage Goals

- Statements: > 80%
- Branches: > 75%
- Functions: > 80%
- Lines: > 80%

See [TESTING.md](TESTING.md) for comprehensive testing guide.

## 📝 Development Workflow

1. **Backend**: `http://localhost:5000`
2. **Frontend**: `http://localhost:5173` (Vite default)
3. **CORS**: Enabled for local development
4. **Images**: Stored in `backend/uploads/`
5. **Authentication**: JWT tokens in localStorage
6. **Protected Routes**: Require valid JWT token

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License

## 🙏 Acknowledgments

- Google Cloud Vision API
- Google Gemini AI
- Open Food Facts (barcode database)
- QuaggaJS (barcode scanning)

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

**Status**: Backend Complete ✅ | Frontend In Progress 🚧

**Last Updated**: January 2026