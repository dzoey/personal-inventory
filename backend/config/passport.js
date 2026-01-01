import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { getOne, runQuery } from './database.js';

// JWT Strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'your_jwt_secret'
};

passport.use(new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    const user = await getOne('SELECT * FROM users WHERE id = ?', [payload.id]);
    if (user) {
      return done(null, user);
    }
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
}));

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists with this Google ID
      let user = await getOne('SELECT * FROM users WHERE google_id = ?', [profile.id]);
      
      if (user) {
        // Update user info if needed
        await runQuery(
          'UPDATE users SET profile_picture = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [profile.photos?.[0]?.value, user.id]
        );
        return done(null, user);
      }
      
      // Check if user exists with this email
      user = await getOne('SELECT * FROM users WHERE email = ?', [profile.emails[0].value]);
      
      if (user) {
        // Link Google account to existing user
        await runQuery(
          'UPDATE users SET google_id = ?, auth_provider = ?, profile_picture = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [profile.id, 'google', profile.photos?.[0]?.value, user.id]
        );
        return done(null, user);
      }
      
      // Create new user
      const result = await runQuery(
        `INSERT INTO users (username, email, google_id, auth_provider, profile_picture) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          profile.displayName || profile.emails[0].value.split('@')[0],
          profile.emails[0].value,
          profile.id,
          'google',
          profile.photos?.[0]?.value
        ]
      );
      
      const newUser = await getOne('SELECT * FROM users WHERE id = ?', [result.id]);
      return done(null, newUser);
    } catch (error) {
      return done(error, false);
    }
  }));
}

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await getOne('SELECT * FROM users WHERE id = ?', [id]);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;

// Made with Bob
