import { runQuery, getOne, getAll } from '../config/database.js';

// Get all categories for the authenticated user
export const getAllCategories = async (req, res) => {
  try {
    const categories = await getAll(
      'SELECT * FROM categories WHERE user_id = ? ORDER BY name',
      [req.user.id]
    );

    // Get item count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const result = await getOne(
          'SELECT COUNT(*) as count FROM items WHERE category_id = ? AND user_id = ?',
          [category.id, req.user.id]
        );
        return {
          ...category,
          item_count: result.count
        };
      })
    );

    res.json({ categories: categoriesWithCount });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

// Get single category
export const getCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await getOne(
      'SELECT * FROM categories WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Get items in this category
    const items = await getAll(
      'SELECT * FROM items WHERE category_id = ? AND user_id = ?',
      [id, req.user.id]
    );

    res.json({ 
      category: {
        ...category,
        items
      }
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
};

// Create new category
export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    // Check if category with same name exists for this user
    const existing = await getOne(
      'SELECT * FROM categories WHERE name = ? AND user_id = ?',
      [name, req.user.id]
    );

    if (existing) {
      return res.status(400).json({ error: 'Category with this name already exists' });
    }

    const result = await runQuery(
      'INSERT INTO categories (user_id, name, description) VALUES (?, ?, ?)',
      [req.user.id, name, description || null]
    );

    const category = await getOne('SELECT * FROM categories WHERE id = ?', [result.id]);

    res.status(201).json({
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
};

// Update category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // Check if category exists and belongs to user
    const existing = await getOne(
      'SELECT * FROM categories WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (!existing) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // If name is being changed, check for duplicates
    if (name && name !== existing.name) {
      const duplicate = await getOne(
        'SELECT * FROM categories WHERE name = ? AND user_id = ? AND id != ?',
        [name, req.user.id, id]
      );

      if (duplicate) {
        return res.status(400).json({ error: 'Category with this name already exists' });
      }
    }

    await runQuery(
      'UPDATE categories SET name = ?, description = ? WHERE id = ? AND user_id = ?',
      [
        name || existing.name,
        description !== undefined ? description : existing.description,
        id,
        req.user.id
      ]
    );

    const category = await getOne('SELECT * FROM categories WHERE id = ?', [id]);

    res.json({
      message: 'Category updated successfully',
      category
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
};

// Delete category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category exists and belongs to user
    const category = await getOne(
      'SELECT * FROM categories WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Check if category has items
    const itemCount = await getOne(
      'SELECT COUNT(*) as count FROM items WHERE category_id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (itemCount.count > 0) {
      return res.status(400).json({ 
        error: `Cannot delete category with ${itemCount.count} item(s). Please reassign or delete items first.` 
      });
    }

    await runQuery('DELETE FROM categories WHERE id = ? AND user_id = ?', [id, req.user.id]);

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
};

// Made with Bob
