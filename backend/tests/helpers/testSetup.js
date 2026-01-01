import { initializeDatabase, runQuery } from '../../config/database.js';

// Setup test database
export const setupTestDatabase = async () => {
  process.env.DATABASE_PATH = ':memory:'; // Use in-memory database for tests
  await initializeDatabase();
};

// Clean up test database
export const cleanupTestDatabase = async () => {
  const tables = ['items', 'containers', 'locations', 'categories', 'users'];
  
  for (const table of tables) {
    await runQuery(`DELETE FROM ${table}`);
  }
};

// Create test user
export const createTestUser = async () => {
  const result = await runQuery(
    `INSERT INTO users (username, email, password_hash, auth_provider) 
     VALUES (?, ?, ?, ?)`,
    ['testuser', 'test@example.com', '$2b$10$abcdefghijklmnopqrstuv', 'local']
  );
  
  return result.id;
};

// Create test category
export const createTestCategory = async (userId, name = 'Test Category') => {
  const result = await runQuery(
    'INSERT INTO categories (user_id, name, description) VALUES (?, ?, ?)',
    [userId, name, 'Test description']
  );
  
  return result.id;
};

// Create test location
export const createTestLocation = async (userId, name = 'Test Location', parentId = null) => {
  const result = await runQuery(
    'INSERT INTO locations (user_id, name, description, parent_location_id) VALUES (?, ?, ?, ?)',
    [userId, name, 'Test location description', parentId]
  );
  
  return result.id;
};

// Create test container
export const createTestContainer = async (userId, name = 'Test Container', locationId = null) => {
  const result = await runQuery(
    'INSERT INTO containers (user_id, name, description, location_id) VALUES (?, ?, ?, ?)',
    [userId, name, 'Test container description', locationId]
  );
  
  return result.id;
};

// Create test item
export const createTestItem = async (userId, name = 'Test Item', categoryId = null) => {
  const result = await runQuery(
    `INSERT INTO items (user_id, name, description, quantity, category_id) 
     VALUES (?, ?, ?, ?, ?)`,
    [userId, name, 'Test item description', 1, categoryId]
  );
  
  return result.id;
};

// Generate test JWT token
export const generateTestToken = (userId) => {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { id: userId, email: 'test@example.com' },
    process.env.JWT_SECRET || 'test_secret',
    { expiresIn: '1h' }
  );
};

export default {
  setupTestDatabase,
  cleanupTestDatabase,
  createTestUser,
  createTestCategory,
  createTestLocation,
  createTestContainer,
  createTestItem,
  generateTestToken
};

// Made with Bob
