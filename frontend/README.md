# Personal Inventory System - Frontend

React-based frontend application for the Personal Inventory Management System.

## Features

- 🔐 User authentication (email/password and Google OAuth)
- 📦 Item management with image support
- 🏷️ Category organization
- 📍 Location tracking
- 📦 Container management
- 🔍 Search and filtering
- 📱 Responsive design

## Tech Stack

- **React 18** - UI library
- **React Router** - Navigation
- **Axios** - HTTP client
- **Vite** - Build tool
- **Lucide React** - Icons

## Prerequisites

- Node.js 16 or higher
- npm or yarn
- Backend API running on port 5000

## Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
VITE_API_URL=http://localhost:5000/api
```

For local network access, use your server's IP:
```env
VITE_API_URL=http://192.168.x.x:5000/api
```

## Running the Application

### Development Mode

Start the development server:
```bash
npm run dev
```

The application will be available at:
- Local: `http://localhost:5173`
- Network: `http://192.168.x.x:5173` (your local IP)

### Production Build

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

The build output will be in the `dist/` directory.

## Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable components
│   │   └── Layout.jsx   # Main layout with navigation
│   ├── contexts/        # React contexts
│   │   └── AuthContext.jsx  # Authentication state
│   ├── pages/           # Page components
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Items.jsx
│   │   ├── ItemDetail.jsx
│   │   ├── Categories.jsx
│   │   ├── Locations.jsx
│   │   └── Containers.jsx
│   ├── services/        # API services
│   │   └── api.js       # Axios configuration and API calls
│   ├── App.jsx          # Main app component with routing
│   ├── main.jsx         # Application entry point
│   └── index.css        # Global styles
├── index.html           # HTML template
├── vite.config.js       # Vite configuration
├── package.json         # Dependencies
└── .env                 # Environment variables
```

## Available Pages

### Public Routes
- `/login` - User login
- `/register` - User registration

### Protected Routes (require authentication)
- `/dashboard` - Overview and statistics
- `/items` - Item list and management
- `/items/:id` - Item details
- `/categories` - Category management
- `/locations` - Location management
- `/containers` - Container management

## API Integration

The frontend communicates with the backend API through Axios. All API calls are centralized in `src/services/api.js`.

### Authentication
- JWT tokens are stored in localStorage
- Tokens are automatically attached to requests
- Automatic redirect to login on 401 errors

### Available API Methods

```javascript
// Auth
authAPI.register(data)
authAPI.login(data)
authAPI.googleLogin()

// Items
itemsAPI.getAll(params)
itemsAPI.getById(id)
itemsAPI.create(formData)
itemsAPI.update(id, formData)
itemsAPI.delete(id)
itemsAPI.search(query)

// Categories
categoriesAPI.getAll()
categoriesAPI.create(data)
categoriesAPI.update(id, data)
categoriesAPI.delete(id)

// Locations
locationsAPI.getAll()
locationsAPI.create(data)
locationsAPI.update(id, data)
locationsAPI.delete(id)

// Containers
containersAPI.getAll()
containersAPI.create(data)
containersAPI.update(id, data)
containersAPI.delete(id)
```

## Styling

The application uses custom CSS with CSS variables for theming. Main colors:

- Primary: `#3b82f6` (blue)
- Success: `#10b981` (green)
- Danger: `#ef4444` (red)
- Warning: `#f59e0b` (orange)

Utility classes are available for common patterns:
- `.btn`, `.btn-primary`, `.btn-secondary`, etc.
- `.card` - Card container
- `.input` - Form input
- `.grid`, `.grid-cols-1`, `.grid-cols-2`, `.grid-cols-3`

## Development Tips

### Hot Module Replacement (HMR)
Vite provides fast HMR. Changes to React components will update instantly without full page reload.

### Proxy Configuration
The Vite dev server is configured to proxy `/api` requests to `http://localhost:5000`. This avoids CORS issues during development.

### Adding New Pages
1. Create component in `src/pages/`
2. Add route in `src/App.jsx`
3. Add navigation link in `src/components/Layout.jsx`

## Troubleshooting

### Port Already in Use
If port 5173 is already in use, Vite will automatically try the next available port.

### API Connection Issues
- Ensure backend is running on port 5000
- Check `VITE_API_URL` in `.env`
- Verify CORS settings in backend

### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Authentication Issues
- Clear localStorage: `localStorage.clear()`
- Check JWT token expiration (24 hours by default)
- Verify backend authentication endpoints

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Future Enhancements

- [ ] Image upload and AI analysis for items
- [ ] Barcode scanning
- [ ] Advanced search and filters
- [ ] Bulk operations
- [ ] Export/import functionality
- [ ] Dark mode
- [ ] Mobile app (React Native)

## License

Part of the Personal Inventory Management System.