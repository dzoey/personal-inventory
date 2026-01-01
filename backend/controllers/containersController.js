import { runQuery, getOne, getAll } from '../config/database.js';

// Helper function to build container tree
const buildContainerTree = (containers, parentId = null) => {
  return containers
    .filter(cont => cont.parent_container_id === parentId)
    .map(cont => ({
      ...cont,
      children: buildContainerTree(containers, cont.id)
    }));
};

// Get all containers for the authenticated user
export const getAllContainers = async (req, res) => {
  try {
    const { location_id, flat } = req.query;

    let sql = `
      SELECT c.*, l.name as location_name 
      FROM containers c
      LEFT JOIN locations l ON c.location_id = l.id
      WHERE c.user_id = ?
    `;
    const params = [req.user.id];

    if (location_id) {
      sql += ' AND c.location_id = ?';
      params.push(location_id);
    }

    sql += ' ORDER BY c.name';

    const containers = await getAll(sql, params);

    // Add item counts
    const containersWithCounts = await Promise.all(
      containers.map(async (container) => {
        const itemCount = await getOne(
          'SELECT COUNT(*) as count FROM items WHERE container_id = ? AND user_id = ?',
          [container.id, req.user.id]
        );
        const childCount = await getOne(
          'SELECT COUNT(*) as count FROM containers WHERE parent_container_id = ?',
          [container.id]
        );
        return {
          ...container,
          item_count: itemCount.count,
          child_count: childCount.count
        };
      })
    );

    // Return flat list or tree structure
    if (flat === 'true') {
      res.json({ containers: containersWithCounts });
    } else {
      const tree = buildContainerTree(containersWithCounts);
      res.json({ containers: tree });
    }
  } catch (error) {
    console.error('Get containers error:', error);
    res.status(500).json({ error: 'Failed to fetch containers' });
  }
};

// Get single container with contents
export const getContainer = async (req, res) => {
  try {
    const { id } = req.params;

    const container = await getOne(`
      SELECT c.*, l.name as location_name 
      FROM containers c
      LEFT JOIN locations l ON c.location_id = l.id
      WHERE c.id = ? AND c.user_id = ?
    `, [id, req.user.id]);

    if (!container) {
      return res.status(404).json({ error: 'Container not found' });
    }

    // Get parent container if exists
    let parent = null;
    if (container.parent_container_id) {
      parent = await getOne(
        'SELECT id, name FROM containers WHERE id = ?',
        [container.parent_container_id]
      );
    }

    // Get child containers
    const children = await getAll(
      'SELECT * FROM containers WHERE parent_container_id = ? AND user_id = ?',
      [id, req.user.id]
    );

    // Get items in this container
    const items = await getAll(
      'SELECT * FROM items WHERE container_id = ? AND user_id = ?',
      [id, req.user.id]
    );

    res.json({
      container: {
        ...container,
        parent,
        children,
        items
      }
    });
  } catch (error) {
    console.error('Get container error:', error);
    res.status(500).json({ error: 'Failed to fetch container' });
  }
};

// Create new container
export const createContainer = async (req, res) => {
  try {
    const {
      name,
      description,
      location_id,
      parent_container_id,
      barcode,
      barcode_type
    } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Container name is required' });
    }

    // If location_id is provided, verify it exists and belongs to user
    if (location_id) {
      const location = await getOne(
        'SELECT * FROM locations WHERE id = ? AND user_id = ?',
        [location_id, req.user.id]
      );

      if (!location) {
        return res.status(400).json({ error: 'Location not found' });
      }
    }

    // If parent_container_id is provided, verify it exists and belongs to user
    if (parent_container_id) {
      const parent = await getOne(
        'SELECT * FROM containers WHERE id = ? AND user_id = ?',
        [parent_container_id, req.user.id]
      );

      if (!parent) {
        return res.status(400).json({ error: 'Parent container not found' });
      }
    }

    // Get image path if uploaded
    const image_path = req.file ? `/uploads/${req.file.filename}` : null;

    const result = await runQuery(
      `INSERT INTO containers (
        user_id, name, description, location_id, parent_container_id, 
        barcode, barcode_type, image_path
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        name,
        description || null,
        location_id || null,
        parent_container_id || null,
        barcode || null,
        barcode_type || null,
        image_path
      ]
    );

    const container = await getOne('SELECT * FROM containers WHERE id = ?', [result.id]);

    res.status(201).json({
      message: 'Container created successfully',
      container
    });
  } catch (error) {
    console.error('Create container error:', error);
    res.status(500).json({ error: 'Failed to create container' });
  }
};

// Update container
export const updateContainer = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      location_id,
      parent_container_id,
      barcode,
      barcode_type
    } = req.body;

    // Check if container exists and belongs to user
    const existing = await getOne(
      'SELECT * FROM containers WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (!existing) {
      return res.status(404).json({ error: 'Container not found' });
    }

    // Prevent circular references
    if (parent_container_id) {
      if (parent_container_id === id) {
        return res.status(400).json({ error: 'Container cannot be its own parent' });
      }

      // Check if new parent exists and belongs to user
      const parent = await getOne(
        'SELECT * FROM containers WHERE id = ? AND user_id = ?',
        [parent_container_id, req.user.id]
      );

      if (!parent) {
        return res.status(400).json({ error: 'Parent container not found' });
      }

      // Check if new parent is a descendant of this container
      const checkDescendant = async (containerId, targetId) => {
        const children = await getAll(
          'SELECT id FROM containers WHERE parent_container_id = ?',
          [containerId]
        );
        
        for (const child of children) {
          if (child.id === targetId) return true;
          if (await checkDescendant(child.id, targetId)) return true;
        }
        return false;
      };

      if (await checkDescendant(id, parent_container_id)) {
        return res.status(400).json({ 
          error: 'Cannot set a descendant container as parent (circular reference)' 
        });
      }
    }

    // Verify location if provided
    if (location_id) {
      const location = await getOne(
        'SELECT * FROM locations WHERE id = ? AND user_id = ?',
        [location_id, req.user.id]
      );

      if (!location) {
        return res.status(400).json({ error: 'Location not found' });
      }
    }

    // Get image path if uploaded, otherwise keep existing
    const image_path = req.file 
      ? `/uploads/${req.file.filename}` 
      : existing.image_path;

    await runQuery(
      `UPDATE containers SET 
        name = ?, 
        description = ?, 
        location_id = ?,
        parent_container_id = ?,
        barcode = ?,
        barcode_type = ?,
        image_path = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`,
      [
        name || existing.name,
        description !== undefined ? description : existing.description,
        location_id !== undefined ? location_id : existing.location_id,
        parent_container_id !== undefined ? parent_container_id : existing.parent_container_id,
        barcode !== undefined ? barcode : existing.barcode,
        barcode_type !== undefined ? barcode_type : existing.barcode_type,
        image_path,
        id,
        req.user.id
      ]
    );

    const container = await getOne('SELECT * FROM containers WHERE id = ?', [id]);

    res.json({
      message: 'Container updated successfully',
      container
    });
  } catch (error) {
    console.error('Update container error:', error);
    res.status(500).json({ error: 'Failed to update container' });
  }
};

// Delete container
export const deleteContainer = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if container exists and belongs to user
    const container = await getOne(
      'SELECT * FROM containers WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (!container) {
      return res.status(404).json({ error: 'Container not found' });
    }

    // Check for child containers
    const childCount = await getOne(
      'SELECT COUNT(*) as count FROM containers WHERE parent_container_id = ?',
      [id]
    );

    if (childCount.count > 0) {
      return res.status(400).json({ 
        error: `Cannot delete container with ${childCount.count} child container(s). Please delete or move them first.` 
      });
    }

    // Check for items
    const itemCount = await getOne(
      'SELECT COUNT(*) as count FROM items WHERE container_id = ?',
      [id]
    );

    if (itemCount.count > 0) {
      return res.status(400).json({ 
        error: `Cannot delete container with ${itemCount.count} item(s). Please move or delete them first.` 
      });
    }

    await runQuery('DELETE FROM containers WHERE id = ? AND user_id = ?', [id, req.user.id]);

    res.json({ message: 'Container deleted successfully' });
  } catch (error) {
    console.error('Delete container error:', error);
    res.status(500).json({ error: 'Failed to delete container' });
  }
};

// Get container by barcode
export const getContainerByBarcode = async (req, res) => {
  try {
    const { barcode } = req.params;

    const container = await getOne(`
      SELECT c.*, l.name as location_name 
      FROM containers c
      LEFT JOIN locations l ON c.location_id = l.id
      WHERE c.barcode = ? AND c.user_id = ?
    `, [barcode, req.user.id]);

    if (!container) {
      return res.status(404).json({ error: 'Container not found' });
    }

    // Get items in this container
    const items = await getAll(
      'SELECT * FROM items WHERE container_id = ? AND user_id = ?',
      [container.id, req.user.id]
    );

    res.json({ 
      container: {
        ...container,
        items
      }
    });
  } catch (error) {
    console.error('Get container by barcode error:', error);
    res.status(500).json({ error: 'Failed to fetch container' });
  }
};

// Made with Bob
