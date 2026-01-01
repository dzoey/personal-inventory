import { lookupBarcode, validateBarcode, parseBarcodeData } from '../services/barcodeService.js';
import { detectBarcodes } from '../services/visionService.js';
import { enhanceWithBarcode } from '../services/geminiService.js';
import { getOne, runQuery } from '../config/database.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Scan and process barcode from image
export const scanBarcode = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const imagePath = path.join(__dirname, '..', req.file.path);

    // Detect barcodes in image using Vision API
    const detection = await detectBarcodes(imagePath);

    if (!detection.barcodes || detection.barcodes.length === 0) {
      return res.status(404).json({ 
        error: 'No barcode detected in image',
        texts_found: detection.texts 
      });
    }

    const barcode = detection.barcodes[0];
    
    // Validate barcode
    const validation = validateBarcode(barcode.value);

    // Lookup product information
    let productInfo = null;
    try {
      const lookup = await lookupBarcode(barcode.value);
      if (lookup.found) {
        productInfo = lookup.data;
      }
    } catch (error) {
      console.error('Barcode lookup failed:', error.message);
    }

    res.json({
      success: true,
      barcode: {
        value: barcode.value,
        format: barcode.format || validation.format,
        valid: validation.valid
      },
      product: productInfo,
      image_path: `/uploads/${req.file.filename}`
    });
  } catch (error) {
    console.error('Barcode scan error:', error);
    res.status(500).json({ 
      error: 'Failed to scan barcode',
      details: error.message 
    });
  }
};

// Lookup barcode information
export const lookupBarcodeInfo = async (req, res) => {
  try {
    const { barcode } = req.params;

    if (!barcode) {
      return res.status(400).json({ error: 'Barcode is required' });
    }

    // Validate barcode format
    const validation = validateBarcode(barcode);

    if (!validation.valid) {
      return res.status(400).json({ 
        error: 'Invalid barcode format',
        barcode: barcode 
      });
    }

    // Check if item exists in user's inventory
    const existingItem = await getOne(
      'SELECT * FROM items WHERE barcode = ? AND user_id = ?',
      [barcode, req.user.id]
    );

    // Lookup product information
    const lookup = await lookupBarcode(barcode);

    res.json({
      success: true,
      barcode: {
        value: barcode,
        format: validation.format,
        valid: validation.valid
      },
      product: lookup.found ? lookup.data : null,
      in_inventory: !!existingItem,
      inventory_item: existingItem || null
    });
  } catch (error) {
    console.error('Barcode lookup error:', error);
    res.status(500).json({ 
      error: 'Failed to lookup barcode',
      details: error.message 
    });
  }
};

// Register new item using barcode
export const registerItemWithBarcode = async (req, res) => {
  try {
    const { barcode, name, description, category_id, container_id, location_id, quantity } = req.body;

    if (!barcode) {
      return res.status(400).json({ error: 'Barcode is required' });
    }

    // Validate barcode
    const validation = validateBarcode(barcode);

    if (!validation.valid) {
      return res.status(400).json({ 
        error: 'Invalid barcode format',
        barcode: barcode 
      });
    }

    // Check if item with this barcode already exists
    const existing = await getOne(
      'SELECT * FROM items WHERE barcode = ? AND user_id = ?',
      [barcode, req.user.id]
    );

    if (existing) {
      return res.status(400).json({ 
        error: 'Item with this barcode already exists',
        item: existing 
      });
    }

    // Lookup product information if name not provided
    let itemName = name;
    let itemDescription = description;
    let barcodeType = validation.format;

    if (!itemName) {
      try {
        const lookup = await lookupBarcode(barcode);
        if (lookup.found) {
          itemName = lookup.data.name;
          itemDescription = itemDescription || lookup.data.description;
          barcodeType = lookup.data.barcode_type || validation.format;
        }
      } catch (error) {
        console.error('Barcode lookup failed:', error.message);
      }
    }

    if (!itemName) {
      return res.status(400).json({ 
        error: 'Item name is required (could not auto-detect from barcode)' 
      });
    }

    // Get image path if uploaded
    const image_path = req.file ? `/uploads/${req.file.filename}` : null;

    // Create item
    const result = await runQuery(
      `INSERT INTO items (
        user_id, name, description, quantity, category_id, 
        container_id, location_id, barcode, barcode_type, image_path
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        itemName,
        itemDescription || null,
        quantity || 1,
        category_id || null,
        container_id || null,
        location_id || null,
        barcode,
        barcodeType,
        image_path
      ]
    );

    const item = await getOne('SELECT * FROM items WHERE id = ?', [result.id]);

    res.status(201).json({
      success: true,
      message: 'Item registered successfully',
      item
    });
  } catch (error) {
    console.error('Item registration error:', error);
    res.status(500).json({ 
      error: 'Failed to register item',
      details: error.message 
    });
  }
};

// Find item location by barcode
export const findItemByBarcode = async (req, res) => {
  try {
    const { barcode } = req.params;

    if (!barcode) {
      return res.status(400).json({ error: 'Barcode is required' });
    }

    // Find item in inventory
    const item = await getOne(
      `SELECT i.*, c.name as category_name, 
              cont.name as container_name, l.name as location_name
       FROM items i
       LEFT JOIN categories c ON i.category_id = c.id
       LEFT JOIN containers cont ON i.container_id = cont.id
       LEFT JOIN locations l ON i.location_id = l.id
       WHERE i.barcode = ? AND i.user_id = ?`,
      [barcode, req.user.id]
    );

    if (!item) {
      return res.status(404).json({ 
        error: 'Item not found in inventory',
        barcode: barcode 
      });
    }

    // Get full location path if item is in a container
    let locationPath = [];
    if (item.location_name) {
      locationPath.push(item.location_name);
    }
    if (item.container_name) {
      locationPath.push(item.container_name);
    }

    res.json({
      success: true,
      item: {
        id: item.id,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        category: item.category_name,
        location: item.location_name,
        container: item.container_name,
        location_path: locationPath.join(' > '),
        barcode: item.barcode,
        image_path: item.image_path
      }
    });
  } catch (error) {
    console.error('Find item error:', error);
    res.status(500).json({ 
      error: 'Failed to find item',
      details: error.message 
    });
  }
};

// Validate barcode format
export const validateBarcodeFormat = async (req, res) => {
  try {
    const { barcode } = req.body;

    if (!barcode) {
      return res.status(400).json({ error: 'Barcode is required' });
    }

    const validation = validateBarcode(barcode);

    res.json({
      success: true,
      validation
    });
  } catch (error) {
    console.error('Barcode validation error:', error);
    res.status(500).json({ 
      error: 'Failed to validate barcode',
      details: error.message 
    });
  }
};

// Made with Bob
