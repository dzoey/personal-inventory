import request from 'supertest';
import app from '../../server.js';
import {
  setupTestDatabase,
  cleanupTestDatabase,
  createTestUser,
  createTestCategory,
  generateTestToken
} from '../helpers/testSetup.js';

describe('Items API', () => {
  let userId;
  let token;
  let categoryId;

  beforeAll(async () => {
    await setupTestDatabase();
  });

  beforeEach(async () => {
    userId = await createTestUser();
    token = generateTestToken(userId);
    categoryId = await createTestCategory(userId);
  });

  afterEach(async () => {
    await cleanupTestDatabase();
  });

  describe('POST /api/items', () => {
    it('should create a new item', async () => {
      const response = await request(app)
        .post('/api/items')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test Item',
          description: 'Test description',
          quantity: 5,
          category_id: categoryId
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('item');
      expect(response.body.item.name).toBe('Test Item');
      expect(response.body.item.quantity).toBe(5);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({
          name: 'Test Item',
          description: 'Test description'
        });

      expect(response.status).toBe(401);
    });

    it('should fail without item name', async () => {
      const response = await request(app)
        .post('/api/items')
        .set('Authorization', `Bearer ${token}`)
        .send({
          description: 'Test description'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('name');
    });

    it('should create item with barcode', async () => {
      const response = await request(app)
        .post('/api/items')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Barcode Item',
          barcode: '123456789012',
          barcode_type: 'EAN-13'
        });

      expect(response.status).toBe(201);
      expect(response.body.item.barcode).toBe('123456789012');
    });
  });

  describe('GET /api/items', () => {
    beforeEach(async () => {
      // Create test items
      await request(app)
        .post('/api/items')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Item 1', category_id: categoryId });

      await request(app)
        .post('/api/items')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Item 2', category_id: categoryId });
    });

    it('should get all items for authenticated user', async () => {
      const response = await request(app)
        .get('/api/items')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('items');
      expect(response.body.items).toHaveLength(2);
    });

    it('should filter items by search term', async () => {
      const response = await request(app)
        .get('/api/items?search=Item 1')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0].name).toBe('Item 1');
    });

    it('should filter items by category', async () => {
      const response = await request(app)
        .get(`/api/items?category_id=${categoryId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.items).toHaveLength(2);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/items');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/items/:id', () => {
    let itemId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/items')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Single Item', category_id: categoryId });
      
      itemId = response.body.item.id;
    });

    it('should get single item by id', async () => {
      const response = await request(app)
        .get(`/api/items/${itemId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('item');
      expect(response.body.item.name).toBe('Single Item');
    });

    it('should return 404 for non-existent item', async () => {
      const response = await request(app)
        .get('/api/items/99999')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/items/:id', () => {
    let itemId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/items')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Original Name', quantity: 1 });
      
      itemId = response.body.item.id;
    });

    it('should update item successfully', async () => {
      const response = await request(app)
        .put(`/api/items/${itemId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Name',
          quantity: 10
        });

      expect(response.status).toBe(200);
      expect(response.body.item.name).toBe('Updated Name');
      expect(response.body.item.quantity).toBe(10);
    });

    it('should return 404 for non-existent item', async () => {
      const response = await request(app)
        .put('/api/items/99999')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated' });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/items/:id', () => {
    let itemId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/items')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'To Delete' });
      
      itemId = response.body.item.id;
    });

    it('should delete item successfully', async () => {
      const response = await request(app)
        .delete(`/api/items/${itemId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('deleted');

      // Verify item is deleted
      const getResponse = await request(app)
        .get(`/api/items/${itemId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(getResponse.status).toBe(404);
    });

    it('should return 404 for non-existent item', async () => {
      const response = await request(app)
        .delete('/api/items/99999')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/items/barcode/:barcode', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/items')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Barcode Item',
          barcode: '123456789012'
        });
    });

    it('should find item by barcode', async () => {
      const response = await request(app)
        .get('/api/items/barcode/123456789012')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.item.name).toBe('Barcode Item');
      expect(response.body.item.barcode).toBe('123456789012');
    });

    it('should return 404 for non-existent barcode', async () => {
      const response = await request(app)
        .get('/api/items/barcode/999999999999')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });
});

// Made with Bob
