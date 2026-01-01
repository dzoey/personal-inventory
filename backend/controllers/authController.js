import bcrypt from 'bcrypt';
import { runQuery, getOne } from '../config/database.js';
import { generateToken } from '../middleware/auth.js';

// Register new user
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user already exists
    const existingUser = await getOne(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existingUser) {
      return res.status(400).json({ 
        error: existingUser.email === email ? 'Email already registered' : 'Username already taken'
      });
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Create user
    const result = await runQuery(
      `INSERT INTO users (username, email, password_hash, auth_provider) 
       VALUES (?, ?, ?, ?)`,
      [username || email.split('@')[0], email, password_hash, 'local']
    );

    // Get created user
    const user = await getOne('SELECT * FROM users WHERE id = ?', [result.id]);

    // Generate token
    const token = generateToken(user);

    // Return user info (without password hash)
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        auth_provider: user.auth_provider,
        profile_picture: user.profile_picture
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await getOne('SELECT * FROM users WHERE email = ?', [email]);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if user registered with Google
    if (user.auth_provider === 'google' && !user.password_hash) {
      return res.status(401).json({ 
        error: 'This account uses Google Sign-In. Please sign in with Google.' 
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user);

    // Return user info
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        auth_provider: user.auth_provider,
        profile_picture: user.profile_picture
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

// Get current user info
export const getCurrentUser = async (req, res) => {
  try {
    // User is already attached to req by auth middleware
    res.json({
      user: req.user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user info' });
  }
};

// Google OAuth callback handler
export const googleCallback = async (req, res) => {
  try {
    // User is attached by passport
    const token = generateToken(req.user);
    
    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  } catch (error) {
    console.error('Google callback error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth/callback?error=authentication_failed`);
  }
};

// Logout (client-side token removal, but can be used for logging)
export const logout = async (req, res) => {
  try {
    // In a JWT system, logout is primarily client-side (remove token)
    // But we can log the event or perform cleanup if needed
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
};

// Made with Bob
