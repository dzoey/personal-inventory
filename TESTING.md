# Testing Guide

Comprehensive guide for testing the Personal Inventory Management System.

## Table of Contents

1. [Test Setup](#test-setup)
2. [Running Tests](#running-tests)
3. [Test Structure](#test-structure)
4. [Writing Tests](#writing-tests)
5. [Test Coverage](#test-coverage)
6. [Continuous Integration](#continuous-integration)

## Test Setup

### Prerequisites

Ensure you have the following installed:
- Node.js (v16 or higher)
- npm or yarn
- All project dependencies

### Install Test Dependencies

```bash
cd backend
npm install
```

This will install:
- **Jest**: Testing framework
- **Supertest**: HTTP assertion library
- **@types/jest**: TypeScript definitions for Jest

### Environment Configuration

Tests use an in-memory SQLite database, so no additional database setup is required.

Create a test environment file if needed:

```bash
# backend/.env.test
NODE_ENV=test
JWT_SECRET=test_secret_key
DATABASE_PATH=:memory:
```

## Running Tests

### Run All Tests

```bash
cd backend
npm test
```

This will:
- Run all unit and integration tests
- Generate coverage report
- Display results in verbose mode

### Run Tests in Watch Mode

Automatically re-run tests when files change:

```bash
npm run test:watch
```

### Run Unit Tests Only

```bash
npm run test:unit
```

### Run Integration Tests Only

```bash
npm run test:integration
```

### Run Specific Test File

```bash
npm test -- auth.test.js
```

### Run Tests with Coverage

```bash
npm test -- --coverage
```

Coverage report will be generated in `backend/coverage/` directory.

## Test Structure

```
backend/tests/
├── unit/                    # Unit tests
│   └── barcodeService.test.js
├── integration/             # Integration tests
│   ├── auth.test.js
│   └── items.test.js
└── helpers/                 # Test utilities
    └── testSetup.js
```

### Unit Tests

Test individual functions and modules in isolation.

**Location**: `backend/tests/unit/`

**Example**: Testing barcode validation logic

### Integration Tests

Test API endpoints and their interactions with the database.

**Location**: `backend/tests/integration/`

**Example**: Testing authentication flow end-to-end

### Test Helpers

Reusable utilities for setting up test data and environments.

**Location**: `backend/tests/helpers/`

## Writing Tests

### Basic Test Structure

```javascript
import request from 'supertest';
import app from '../../server.js';
import { setupTestDatabase, cleanupTestDatabase } from '../helpers/testSetup.js';

describe('Feature Name', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterEach(async () => {
    await cleanupTestDatabase();
  });

  describe('Specific Functionality', () => {
    it('should do something specific', async () => {
      // Arrange
      const testData = { /* ... */ };

      // Act
      const response = await request(app)
        .post('/api/endpoint')
        .send(testData);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
    });
  });
});
```

### Testing Authenticated Endpoints

```javascript
import { createTestUser, generateTestToken } from '../helpers/testSetup.js';

describe('Protected Endpoint', () => {
  let token;

  beforeEach(async () => {
    const userId = await createTestUser();
    token = generateTestToken(userId);
  });

  it('should access protected route', async () => {
    const response = await request(app)
      .get('/api/protected')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
  });
});
```

### Testing File Uploads

```javascript
it('should upload an image', async () => {
  const response = await request(app)
    .post('/api/items')
    .set('Authorization', `Bearer ${token}`)
    .field('name', 'Test Item')
    .attach('image', 'path/to/test/image.jpg');

  expect(response.status).toBe(201);
  expect(response.body.item.image_path).toBeDefined();
});
```

### Testing Error Cases

```javascript
it('should return 400 for invalid input', async () => {
  const response = await request(app)
    .post('/api/items')
    .set('Authorization', `Bearer ${token}`)
    .send({ /* missing required fields */ });

  expect(response.status).toBe(400);
  expect(response.body).toHaveProperty('error');
});
```

## Test Coverage

### Current Coverage

Run tests with coverage to see current metrics:

```bash
npm test -- --coverage
```

### Coverage Goals

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

### View Coverage Report

After running tests with coverage:

```bash
# Open HTML report
open coverage/lcov-report/index.html
```

### Coverage by Module

| Module | Coverage Target | Status |
|--------|----------------|--------|
| Authentication | 90% | ✅ |
| Items API | 85% | ✅ |
| Categories API | 85% | 🚧 |
| Locations API | 85% | 🚧 |
| Containers API | 85% | 🚧 |
| Barcode Service | 90% | ✅ |
| AI Services | 70% | 🚧 |

## Available Test Suites

### 1. Authentication Tests (`auth.test.js`)

Tests for user registration, login, and authentication:

- ✅ User registration with email/password
- ✅ User login with valid credentials
- ✅ Token validation
- ✅ Protected route access
- ✅ Error handling for invalid credentials

**Run:**
```bash
npm test -- auth.test.js
```

### 2. Items Tests (`items.test.js`)

Tests for inventory item management:

- ✅ Create, read, update, delete items
- ✅ Search and filter functionality
- ✅ Barcode association
- ✅ Category assignment
- ✅ Authorization checks

**Run:**
```bash
npm test -- items.test.js
```

### 3. Barcode Service Tests (`barcodeService.test.js`)

Unit tests for barcode validation and processing:

- ✅ Barcode format validation
- ✅ Check digit calculation
- ✅ Barcode parsing
- ✅ Format suggestions

**Run:**
```bash
npm test -- barcodeService.test.js
```

## Test Data Management

### Creating Test Data

Use helper functions from `testSetup.js`:

```javascript
import {
  createTestUser,
  createTestCategory,
  createTestLocation,
  createTestContainer,
  createTestItem
} from '../helpers/testSetup.js';

// Create test user
const userId = await createTestUser();

// Create test category
const categoryId = await createTestCategory(userId, 'Electronics');

// Create test item
const itemId = await createTestItem(userId, 'Laptop', categoryId);
```

### Cleaning Up Test Data

Always clean up after tests:

```javascript
afterEach(async () => {
  await cleanupTestDatabase();
});
```

## Mocking External Services

### Mocking AI Services

For tests that don't require actual AI calls:

```javascript
jest.mock('../../services/geminiService.js', () => ({
  identifyItem: jest.fn().mockResolvedValue({
    name: 'Mocked Item',
    description: 'Mocked description',
    category: 'Mocked Category',
    confidence: 95
  })
}));
```

### Mocking File Uploads

```javascript
jest.mock('multer', () => {
  return () => ({
    single: () => (req, res, next) => {
      req.file = {
        filename: 'test-image.jpg',
        path: '/uploads/test-image.jpg'
      };
      next();
    }
  });
});
```

## Debugging Tests

### Run Single Test

```bash
npm test -- -t "should register a new user"
```

### Enable Debug Output

```bash
DEBUG=* npm test
```

### Use Node Inspector

```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

Then open `chrome://inspect` in Chrome.

## Continuous Integration

### GitHub Actions Example

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      
      - name: Install dependencies
        run: |
          cd backend
          npm install
      
      - name: Run tests
        run: |
          cd backend
          npm test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v2
        with:
          directory: ./backend/coverage
```

## Best Practices

### 1. Test Naming

Use descriptive test names:

```javascript
// Good
it('should return 401 when token is missing')

// Bad
it('test auth')
```

### 2. Arrange-Act-Assert Pattern

```javascript
it('should create a new item', async () => {
  // Arrange
  const itemData = { name: 'Test Item' };
  
  // Act
  const response = await request(app)
    .post('/api/items')
    .send(itemData);
  
  // Assert
  expect(response.status).toBe(201);
});
```

### 3. Test Independence

Each test should be independent:

```javascript
// Good - creates its own data
it('should update item', async () => {
  const itemId = await createTestItem(userId);
  // test update
});

// Bad - depends on previous test
it('should update the item created earlier', async () => {
  // assumes item exists
});
```

### 4. Use beforeEach/afterEach

```javascript
describe('Items API', () => {
  let userId, token;

  beforeEach(async () => {
    userId = await createTestUser();
    token = generateTestToken(userId);
  });

  afterEach(async () => {
    await cleanupTestDatabase();
  });

  // tests...
});
```

### 5. Test Edge Cases

```javascript
it('should handle empty search query', async () => {
  const response = await request(app)
    .get('/api/items?search=')
    .set('Authorization', `Bearer ${token}`);

  expect(response.status).toBe(200);
});
```

## Troubleshooting

### Tests Failing Randomly

- Ensure proper cleanup between tests
- Check for async/await issues
- Verify test independence

### Database Locked Errors

- Use in-memory database for tests
- Ensure proper connection closing

### Timeout Errors

Increase Jest timeout:

```javascript
jest.setTimeout(10000); // 10 seconds
```

### Module Not Found

- Check import paths
- Ensure all dependencies are installed
- Verify file extensions (.js)

## Adding New Tests

### 1. Create Test File

```bash
touch backend/tests/integration/newFeature.test.js
```

### 2. Write Test Suite

```javascript
import request from 'supertest';
import app from '../../server.js';

describe('New Feature', () => {
  // tests...
});
```

### 3. Run Tests

```bash
npm test -- newFeature.test.js
```

### 4. Update Coverage

```bash
npm test -- --coverage
```

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://testingjavascript.com/)

---

**Last Updated:** January 2026

For questions or issues, please open an issue on GitHub.