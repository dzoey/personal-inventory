import express from 'express';
import passport from 'passport';
import { 
  register, 
  login, 
  getCurrentUser, 
  googleCallback,
  logout 
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Local authentication routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Get current user (protected route)
router.get('/me', authenticateToken, getCurrentUser);

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false 
  })
);

router.get('/google/callback',
  passport.authenticate('google', { 
    session: false,
    failureRedirect: process.env.FRONTEND_URL || 'http://localhost:5173'
  }),
  googleCallback
);

export default router;

// Made with Bob
