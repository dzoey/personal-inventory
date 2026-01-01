# Personal Inventory Application - Complete Project Plan

## Overview
An AI-powered full-stack personal inventory management application with dual authentication (JWT + Google OAuth), barcode scanning, hierarchical location/container management, and intelligent item identification using Google Cloud Vision and Gemini AI.

## Technology Stack

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

### Frontend
- **Framework**: React with Vite
- **HTTP Client**: Axios
- **State Management**: React Query
- **Routing**: React Router DOM
- **Authentication**: @react-oauth/google
- **Barcode Scanning**: QuaggaJS (camera-based)
- **Styling**: TailwindCSS or Material-UI (to be decided during implementation)

## Key Features

### Authentication
- ✅ Traditional email/password registration and login (JWT)
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

### Barcode Features (Optional)
- 📱 **Item Registration**: Scan barcode to auto-populate item details
- 📱 **Location Lookup**: Scan barcode to find where item should be stored
- 📱 **Product Database**: Lookup product information from barcode
- 📱 **Camera-based**: Use device camera for scanning
- 📱 **Manual Entry**: Option to manually enter barcode if camera unavailable

### AI-Powered Features
- 🤖 **Item Identification**: Upload image or provide text description to identify items
- 🤖 **Smart Placement**: AI suggests optimal storage location based on item characteristics
- 🤖 **Natural Language Queries**: Ask questions like "what is this item?" or "where does this belong?"
- 🤖 **Visual Search**: Find items by uploading similar images
- 🤖 **Barcode Integration**: Combine barcode data with AI for enhanced identification

## Architecture

### Database Schema

**Users Table**:
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  google_id TEXT UNIQUE,
  auth_provider TEXT NOT NULL DEFAULT 'local',
  profile_picture TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Items Table**:
```sql
CREATE TABLE items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  quantity INTEGER DEFAULT 1,
  category_id INTEGER,
  container_id INTEGER,
  barcode TEXT,
  barcode_type TEXT,
  image_path TEXT,
  ai_identified BOOLEAN DEFAULT 0,
  ai_confidence REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (container_id) REFERENCES containers(id) ON DELETE SET NULL
);
```

**Categories Table**:
```sql
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Locations Table** (hierarchical):
```sql
CREATE TABLE locations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  parent_location_id INTEGER,
  image_path TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_location_id) REFERENCES locations(id) ON DELETE CASCADE
);
```

**Containers Table** (can be nested, assigned to locations):
```sql
CREATE TABLE containers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  location_id INTEGER,
  parent_container_id INTEGER,
  barcode TEXT,
  barcode_type TEXT,
  image_path TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL,
  FOREIGN KEY (parent_container_id) REFERENCES containers(id) ON DELETE CASCADE
);
```

### Hierarchy Rules
- **Locations** can contain: other locations, containers, items
- **Containers** can contain: other containers, items
- **Containers CANNOT** contain locations
- **Items** can be in: containers OR locations (but not both directly)

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user (email/password)
- `POST /api/auth/login` - Login user (returns JWT)
- `GET /api/auth/google` - Initiate Google OAuth flow
- `GET /api/auth/google/callback` - Google OAuth callback
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - Logout user

#### Items
- `GET /api/items` - List all user's items (with search/filter)
- `GET /api/items/:id` - Get single item
- `POST /api/items` - Create new item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item
- `GET /api/items/barcode/:barcode` - Find item by barcode

#### Categories
- `GET /api/categories` - List all user's categories
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

#### Locations
- `GET /api/locations` - List all user's locations (hierarchical tree)
- `GET /api/locations/:id` - Get single location with contents
- `POST /api/locations` - Create location
- `PUT /api/locations/:id` - Update location
- `DELETE /api/locations/:id` - Delete location (cascade rules apply)

#### Containers
- `GET /api/containers` - List all user's containers
- `GET /api/containers/:id` - Get single container with contents
- `POST /api/containers` - Create container
- `PUT /api/containers/:id` - Update container
- `DELETE /api/containers/:id` - Delete container (cascade rules apply)
- `GET /api/containers/barcode/:barcode` - Find container by barcode

#### AI Services
- `POST /api/ai/identify-item` - Identify item from image/text/barcode
- `POST /api/ai/suggest-placement` - Suggest where item should be stored
- `POST /api/ai/query` - Natural language query processing

#### Barcode Services
- `POST /api/barcode/scan` - Process scanned barcode
- `GET /api/barcode/lookup/:barcode` - Lookup product info by barcode
- `POST /api/barcode/register` - Register new item via barcode

#### Images
- `POST /api/upload` - Upload image (items, containers, locations)

### Project Structure

```
personal-inventory/
├── backend/
│   ├── config/
│   │   ├── database.js
│   │   ├── googleCloud.js
│   │   └── passport.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── itemsController.js
│   │   ├── categoriesController.js
│   │   ├── locationsController.js
│   │   ├── containersController.js
│   │   ├── aiController.js
│   │   └── barcodeController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Item.js
│   │   ├── Category.js
│   │   ├── Location.js
│   │   └── Container.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── items.js
│   │   ├── categories.js
│   │   ├── locations.js
│   │   ├── containers.js
│   │   ├── ai.js
│   │   └── barcode.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── upload.js
│   ├── services/
│   │   ├── visionService.js
│   │   ├── geminiService.js
│   │   └── barcodeService.js
│   ├── uploads/
│   ├── database.db
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── ItemCard.jsx
│   │   │   ├── ItemForm.jsx
│   │   │   ├── SearchFilter.jsx
│   │   │   ├── LocationTree.jsx
│   │   │   ├── ContainerView.jsx
│   │   │   ├── BarcodeScanner.jsx
│   │   │   ├── AIQueryInterface.jsx
│   │   │   └── GoogleSignIn.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ItemsList.jsx
│   │   │   ├── ItemDetail.jsx
│   │   │   ├── ItemForm.jsx
│   │   │   ├── Categories.jsx
│   │   │   ├── Locations.jsx
│   │   │   ├── Containers.jsx
│   │   │   └── AIQuery.jsx
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── barcodeService.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── README.md
└── SETUP.md
```

## Implementation Details

### Barcode Scanning Flow

#### Item Registration with Barcode:
1. User clicks "Scan Barcode" button
2. Camera activates using QuaggaJS
3. Barcode detected and decoded
4. Backend looks up product info (UPC database API)
5. Form auto-populated with product details
6. User can edit and save

#### Location Lookup with Barcode:
1. User scans item barcode
2. System checks if item exists in inventory
3. If exists: shows current location
4. If not exists: AI suggests optimal location
5. User confirms or modifies location

### Authentication Flow

#### JWT Authentication:
1. User registers/logs in with email/password
2. Backend validates and returns JWT token
3. Frontend stores token in localStorage
4. Token included in Authorization header for API requests

#### Google OAuth:
1. User clicks "Sign in with Google"
2. Redirected to Google consent screen
3. Google redirects back with authorization code
4. Backend exchanges code for user info
5. Creates/updates user record
6. Returns JWT token for session management

### AI Integration Flow

#### Item Identification:
1. User uploads image and/or provides text description
2. Optional: includes barcode data
3. Google Cloud Vision analyzes image (labels, objects, text)
4. Gemini processes combined data (image + text + barcode)
5. Returns: item name, description, category, confidence score

#### Smart Placement:
1. User provides item details (image/text/barcode)
2. System analyzes item characteristics
3. Reviews user's existing locations and containers
4. Gemini suggests optimal storage location with reasoning
5. User can accept or choose different location

## Development Workflow

1. **Backend**: `http://localhost:5000`
2. **Frontend**: `http://localhost:5173` (Vite default)
3. **CORS**: Enabled for local development
4. **Images**: Stored in `backend/uploads/`
5. **Authentication**: JWT tokens in localStorage
6. **Protected Routes**: Require valid JWT token

## Setup Requirements

### Google Cloud Setup
1. Create Google Cloud Project
2. Enable APIs:
   - Cloud Vision API
   - Gemini API (Vertex AI)
3. Create OAuth 2.0 credentials:
   - Authorized redirect URIs
   - Client ID and Secret
4. Create service account for Vision/Gemini
5. Download credentials JSON

### Environment Variables

**Backend (.env)**:
```
PORT=5000
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=24h

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Google Cloud AI
GOOGLE_APPLICATION_CREDENTIALS=./path/to/credentials.json
GOOGLE_CLOUD_PROJECT_ID=your_project_id
GEMINI_API_KEY=your_gemini_api_key

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

**Frontend (.env)**:
```
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

## Security Considerations

- ✅ Passwords hashed with bcrypt (10 rounds)
- ✅ JWT tokens with expiration (24 hours)
- ✅ Protected routes require authentication
- ✅ User data isolation (users only see their own data)
- ✅ Input validation and sanitization
- ✅ Rate limiting on AI endpoints (manage API costs)
- ✅ Secure OAuth flow with state parameter
- ✅ HTTPS required in production
- ✅ Environment variables for sensitive data

## Cost Considerations

### Google Cloud APIs
- **Cloud Vision API**: ~$1.50 per 1,000 images
- **Gemini API**: Varies by model and usage
- **Free Tier**: Available for development/testing

### Optimization Strategies
- Implement request caching
- Rate limiting per user
- Batch processing where possible
- Use lower-cost models for simple queries
- Cache barcode lookups

## Database Choice: SQLite vs PostgreSQL

**SQLite is appropriate because**:
- ✅ Handles all required relationships and data types
- ✅ Zero configuration, file-based
- ✅ Perfect for personal/small team use
- ✅ Supports hierarchical data structures
- ✅ Adequate performance for expected load

**Consider PostgreSQL if**:
- Multiple concurrent users (10+)
- Heavy concurrent write operations
- Need for advanced full-text search
- Require replication/backup features
- Planning enterprise-scale deployment

**Migration Path**: SQLite → PostgreSQL is straightforward if needed later.

## Implementation Steps (47 Total)

### Phase 1: Backend Foundation (Steps 1-9)
1. Project structure and initialization
2. Dependencies installation
3. Database schema and models
4. JWT authentication system
5. Google OAuth integration
6. Authentication middleware

### Phase 2: Core API Development (Steps 10-15)
7. Items CRUD endpoints
8. Categories CRUD endpoints
9. Locations CRUD endpoints (hierarchical)
10. Containers CRUD endpoints (nested)
11. Search and filter functionality
12. Image upload handling

### Phase 3: AI & Barcode Integration (Steps 16-22)
13. Google Cloud Vision setup
14. Google Gemini setup
15. Barcode scanning service
16. AI item identification
17. AI placement suggestions
18. Natural language queries
19. Barcode-based operations

### Phase 4: Frontend Foundation (Steps 23-28)
20. React project initialization
21. Dependencies and routing
22. Authentication context (dual auth)
23. Login/registration pages
24. Google Sign-In integration
25. Main layout and navigation

### Phase 5: Feature Implementation (Steps 29-37)
26. Items management UI
27. Categories management UI
28. Locations management UI (tree view)
29. Containers management UI
30. Barcode scanner components
31. AI query interface
32. Image upload components

### Phase 6: Integration & Polish (Steps 38-39)
33. API integration with auth headers
34. Error handling and loading states

### Phase 7: Documentation & Testing (Steps 40-47)
35. README and setup documentation
36. Configuration files
37. End-to-end testing
38. Authentication testing
39. Barcode functionality testing
40. AI features testing
41. Final documentation

## Next Steps

Once this plan is approved, we'll switch to Code mode to begin implementation following the 47-step roadmap.
