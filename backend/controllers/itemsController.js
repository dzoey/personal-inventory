import { runQuery, getOne, getAll } from '../config/database.js';

// Get all items for the authenticated user
export const getAllItems = async (req, res) => {
  try {
    const { search, category_id, container_id, location_id } = req.query;
    
    let sql = `
      SELECT i.*, c.name as category_name, 
             cont.name as container_name, l.name as location_name
      FROM items i
      LEFT JOIN categories c ON i.category_id = c.id
      LEFT JOIN containers cont ON i.container_id = cont.id
      LEFT JOIN locations l ON i.location_id = l.id
      WHERE i.user_id = ?
    `;
    const params = [req.user.id];

    // Add search filter
    if (search) {
      sql += ' AND (i.name LIKE ? OR i.description LIKE ? OR i.barcode LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    // Add category filter
    if (category_id) {
      sql += ' AND i.category_id = ?';
      params.push(category_id);
    }

    // Add container filter
    if (container_id) {
      sql += ' AND i.container_id = ?';
      params.push(container_id);
    }

    // Add location filter
    if (location_id) {
      sql += ' AND i.location_id = ?';
      params.push(location_id);
    }

    sql += ' ORDER BY i.created_at DESC';

    const items = await getAll(sql, params);
    res.json({ items });
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
};

// Get single item
export const getItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    const item = await getOne(`
      SELECT i.*, c.name as category_name, 
             cont.name as container_name, l.name as location_name
      FROM items i
      LEFT JOIN categories c ON i.category_id = c.id
      LEFT JOIN containers cont ON i.container_id = cont.id
      LEFT JOIN locations l ON i.location_id = l.id
      WHERE i.id = ? AND i.user_id = ?
    `, [id, req.user.id]);

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({ item });
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
};

// Create new item
export const createItem = async (req, res) => {
  try {
    const {
      name,
      description,
      quantity,
      category_id,
      container_id,
      location_id,
      barcode,
      barcode_type,
      ai_identified,
      ai_confidence
    } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Item name is required' });
    }

    // Get image path if uploaded
    const image_path = req.file ? `/uploads/${req.file.filename}` : null;

    const result = await runQuery(`
      INSERT INTO items (
        user_id, name, description, quantity, category_id, 
        container_id, location_id, barcode, barcode_type, 
        image_path, ai_identified, ai_confidence
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      req.user.id,
      name,
      description || null,
      quantity || 1,
      category_id || null,
      container_id || null,
      location_id || null,
      barcode || null,
      barcode_type || null,
      image_path,
      ai_identified || 0,
      ai_confidence || null
    ]);

    const item = await getOne('SELECT * FROM items WHERE id = ?', [result.id]);
    res.status(201).json({ 
      message: 'Item created successfully',
      item 
    });
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
};

// Update item
export const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      quantity,
      category_id,
      container_id,
      location_id,
      barcode,
      barcode_type
    } = req.body;

    // Check if item exists and belongs to user
    const existingItem = await getOne(
      'SELECT * FROM items WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (!existingItem) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Get image path if uploaded, otherwise keep existing
    const image_path = req.file 
      ? `/uploads/${req.file.filename}` 
      : existingItem.image_path;

    await runQuery(`
      UPDATE items SET
        name = ?,
        description = ?,
        quantity = ?,
        category_id = ?,
        container_id = ?,
        location_id = ?,
        barcode = ?,
        barcode_type = ?,
        image_path = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `, [
      name || existingItem.name,
      description !== undefined ? description : existingItem.description,
      quantity !== undefined ? quantity : existingItem.quantity,
      category_id !== undefined ? category_id : existingItem.category_id,
      container_id !== undefined ? container_id : existingItem.container_id,
      location_id !== undefined ? location_id : existingItem.location_id,
      barcode !== undefined ? barcode : existingItem.barcode,
      barcode_type !== undefined ? barcode_type : existingItem.barcode_type,
      image_path,
      id,
      req.user.id
    ]);

    const item = await getOne('SELECT * FROM items WHERE id = ?', [id]);
    res.json({ 
      message: 'Item updated successfully',
      item 
    });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
};

// Delete item
export const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if item exists and belongs to user
    const item = await getOne(
      'SELECT * FROM items WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    await runQuery('DELETE FROM items WHERE id = ? AND user_id = ?', [id, req.user.id]);

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
};

// Get item by barcode
export const getItemByBarcode = async (req, res) => {
  try {
    const { barcode } = req.params;

    const item = await getOne(`
      SELECT i.*, c.name as category_name, 
             cont.name as container_name, l.name as location_name
      FROM items i
      LEFT JOIN categories c ON i.category_id = c.id
      LEFT JOIN containers cont ON i.container_id = cont.id
      LEFT JOIN locations l ON i.location_id = l.id
      WHERE i.barcode = ? AND i.user_id = ?
    `, [barcode, req.user.id]);

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({ item });
  } catch (error) {
    console.error('Get item by barcode error:', error);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
};

// Made with Bob
