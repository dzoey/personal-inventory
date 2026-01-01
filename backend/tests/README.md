# Backend Tests

Quick reference for running tests in the Personal Inventory backend.

## Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm test -- --coverage
```

## Test Suites

### Integration Tests

**Authentication Tests** (`integration/auth.test.js`)
- User registration
- User login
- Token validation
- Protected routes

```bash
npm test -- auth.test.js
```

**Items Tests** (`integration/items.test.js`)
- CRUD operations
- Search and filtering
- Barcode lookup
- Authorization

```bash
npm test -- items.test.js
```

### Unit Tests

**Barcode Service Tests** (`unit/barcodeService.test.js`)
- Barcode validation
- Check digit calculation
- Format detection
- Parsing utilities

```bash
npm test -- barcodeService.test.js
```

## Test Structure

```
tests/
├── unit/                    # Unit tests for services
│   └── barcodeService.test.js
├── integration/             # API endpoint tests
│   ├── auth.test.js
│   └── items.test.js
├── helpers/                 # Test utilities
│   └── testSetup.js
└── README.md               # This file
```

## Writing New Tests

1. Create test file in appropriate directory
2. Import test helpers
3. Set up test database
4. Write test cases
5. Clean up after tests

Example:

```javascript
import request from 'supertest';
import app from '../../server.js';
import { setupTestDatabase, cleanupTestDatabase } from '../helpers/testSetup.js';

describe('My Feature', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterEach(async () => {
    await cleanupTestDatabase();
  });

  it('should work correctly', async () => {
    const response = await request(app)
      .get('/api/endpoint');
    
    expect(response.status).toBe(200);
  });
});
```

## Test Helpers

Available helper functions in `helpers/testSetup.js`:

- `setupTestDatabase()` - Initialize in-memory test database
- `cleanupTestDatabase()` - Clear all test data
- `createTestUser()` - Create a test user
- `createTestCategory(userId, name)` - Create a test category
- `createTestLocation(userId, name, parentId)` - Create a test location
- `createTestContainer(userId, name, locationId)` - Create a test container
- `createTestItem(userId, name, categoryId)` - Create a test item
- `generateTestToken(userId)` - Generate JWT token for testing

## Coverage Goals

- Statements: > 80%
- Branches: > 75%
- Functions: > 80%
- Lines: > 80%

View coverage report:
```bash
npm test -- --coverage
open coverage/lcov-report/index.html
```

## Debugging

Run specific test:
```bash
npm test -- -t "test name"
```

Run with debugging:
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

## CI/CD

Tests run automatically on:
- Push to main branch
- Pull requests
- Pre-commit hooks (if configured)

## More Information

See [TESTING.md](../../../TESTING.md) for comprehensive testing guide.