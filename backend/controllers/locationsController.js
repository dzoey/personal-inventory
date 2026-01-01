import { runQuery, getOne, getAll } from '../config/database.js';

// Helper function to build location tree
const buildLocationTree = (locations, parentId = null) => {
  return locations
    .filter(loc => loc.parent_location_id === parentId)
    .map(loc => ({
      ...loc,
      children: buildLocationTree(locations, loc.id)
    }));
};

// Get all locations for the authenticated user (as tree)
export const getAllLocations = async (req, res) => {
  try {
    const { flat } = req.query;

    const locations = await getAll(
      'SELECT * FROM locations WHERE user_id = ? ORDER BY name',
      [req.user.id]
    );

    // Add counts for each location
    const locationsWithCounts = await Promise.all(
      locations.map(async (location) => {
        const containerCount = await getOne(
          'SELECT COUNT(*) as count FROM containers WHERE location_id = ? AND user_id = ?',
          [location.id, req.user.id]
        );
        const itemCount = await getOne(
          'SELECT COUNT(*) as count FROM items WHERE location_id = ? AND user_id = ?',
          [location.id, req.user.id]
        );
        return {
          ...location,
          container_count: containerCount.count,
          item_count: itemCount.count
        };
      })
    );

    // Return flat list or tree structure
    if (flat === 'true') {
      res.json({ locations: locationsWithCounts });
    } else {
      const tree = buildLocationTree(locationsWithCounts);
      res.json({ locations: tree });
    }
  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
};

// Get single location with contents
export const getLocation = async (req, res) => {
  try {
    const { id } = req.params;

    const location = await getOne(
      'SELECT * FROM locations WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }

    // Get parent location if exists
    let parent = null;
    if (location.parent_location_id) {
      parent = await getOne(
        'SELECT id, name FROM locations WHERE id = ?',
        [location.parent_location_id]
      );
    }

    // Get child locations
    const children = await getAll(
      'SELECT * FROM locations WHERE parent_location_id = ? AND user_id = ?',
      [id, req.user.id]
    );

    // Get containers in this location
    const containers = await getAll(
      'SELECT * FROM containers WHERE location_id = ? AND user_id = ?',
      [id, req.user.id]
    );

    // Get items directly in this location
    const items = await getAll(
      'SELECT * FROM items WHERE location_id = ? AND user_id = ?',
      [id, req.user.id]
    );

    res.json({
      location: {
        ...location,
        parent,
        children,
        containers,
        items
      }
    });
  } catch (error) {
    console.error('Get location error:', error);
    res.status(500).json({ error: 'Failed to fetch location' });
  }
};

// Create new location
export const createLocation = async (req, res) => {
  try {
    const { name, description, parent_location_id } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Location name is required' });
    }

    // If parent_location_id is provided, verify it exists and belongs to user
    if (parent_location_id) {
      const parent = await getOne(
        'SELECT * FROM locations WHERE id = ? AND user_id = ?',
        [parent_location_id, req.user.id]
      );

      if (!parent) {
        return res.status(400).json({ error: 'Parent location not found' });
      }
    }

    // Get image path if uploaded
    const image_path = req.file ? `/uploads/${req.file.filename}` : null;

    const result = await runQuery(
      `INSERT INTO locations (user_id, name, description, parent_location_id, image_path) 
       VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, name, description || null, parent_location_id || null, image_path]
    );

    const location = await getOne('SELECT * FROM locations WHERE id = ?', [result.id]);

    res.status(201).json({
      message: 'Location created successfully',
      location
    });
  } catch (error) {
    console.error('Create location error:', error);
    res.status(500).json({ error: 'Failed to create location' });
  }
};

// Update location
export const updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, parent_location_id } = req.body;

    // Check if location exists and belongs to user
    const existing = await getOne(
      'SELECT * FROM locations WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (!existing) {
      return res.status(404).json({ error: 'Location not found' });
    }

    // Prevent circular references
    if (parent_location_id) {
      if (parent_location_id === id) {
        return res.status(400).json({ error: 'Location cannot be its own parent' });
      }

      // Check if new parent exists and belongs to user
      const parent = await getOne(
        'SELECT * FROM locations WHERE id = ? AND user_id = ?',
        [parent_location_id, req.user.id]
      );

      if (!parent) {
        return res.status(400).json({ error: 'Parent location not found' });
      }

      // Check if new parent is a descendant of this location
      const checkDescendant = async (locationId, targetId) => {
        const children = await getAll(
          'SELECT id FROM locations WHERE parent_location_id = ?',
          [locationId]
        );
        
        for (const child of children) {
          if (child.id === targetId) return true;
          if (await checkDescendant(child.id, targetId)) return true;
        }
        return false;
      };

      if (await checkDescendant(id, parent_location_id)) {
        return res.status(400).json({ 
          error: 'Cannot set a descendant location as parent (circular reference)' 
        });
      }
    }

    // Get image path if uploaded, otherwise keep existing
    const image_path = req.file 
      ? `/uploads/${req.file.filename}` 
      : existing.image_path;

    await runQuery(
      `UPDATE locations SET 
        name = ?, 
        description = ?, 
        parent_location_id = ?,
        image_path = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`,
      [
        name || existing.name,
        description !== undefined ? description : existing.description,
        parent_location_id !== undefined ? parent_location_id : existing.parent_location_id,
        image_path,
        id,
        req.user.id
      ]
    );

    const location = await getOne('SELECT * FROM locations WHERE id = ?', [id]);

    res.json({
      message: 'Location updated successfully',
      location
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ error: 'Failed to update location' });
  }
};

// Delete location
export const deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if location exists and belongs to user
    const location = await getOne(
      'SELECT * FROM locations WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }

    // Check for child locations
    const childCount = await getOne(
      'SELECT COUNT(*) as count FROM locations WHERE parent_location_id = ?',
      [id]
    );

    if (childCount.count > 0) {
      return res.status(400).json({ 
        error: `Cannot delete location with ${childCount.count} child location(s). Please delete or move them first.` 
      });
    }

    // Check for containers
    const containerCount = await getOne(
      'SELECT COUNT(*) as count FROM containers WHERE location_id = ?',
      [id]
    );

    if (containerCount.count > 0) {
      return res.status(400).json({ 
        error: `Cannot delete location with ${containerCount.count} container(s). Please move or delete them first.` 
      });
    }

    // Check for items
    const itemCount = await getOne(
      'SELECT COUNT(*) as count FROM items WHERE location_id = ?',
      [id]
    );

    if (itemCount.count > 0) {
      return res.status(400).json({ 
        error: `Cannot delete location with ${itemCount.count} item(s). Please move or delete them first.` 
      });
    }

    await runQuery('DELETE FROM locations WHERE id = ? AND user_id = ?', [id, req.user.id]);

    res.json({ message: 'Location deleted successfully' });
  } catch (error) {
    console.error('Delete location error:', error);
    res.status(500).json({ error: 'Failed to delete location' });
  }
};

// Made with Bob
