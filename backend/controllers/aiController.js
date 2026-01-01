import { comprehensiveAnalysis } from '../services/visionService.js';
import { identifyItem, suggestPlacement, processQuery, enhanceWithBarcode } from '../services/geminiService.js';
import { lookupBarcode } from '../services/barcodeService.js';
import { getAll } from '../config/database.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Identify item from image and/or text description
export const identifyItemFromInput = async (req, res) => {
  try {
    const { description, barcode } = req.body;
    const imagePath = req.file ? path.join(__dirname, '..', req.file.path) : null;

    if (!description && !imagePath && !barcode) {
      return res.status(400).json({ 
        error: 'Please provide at least a description, image, or barcode' 
      });
    }

    let visionData = null;
    let barcodeData = null;

    // Analyze image if provided
    if (imagePath) {
      try {
        visionData = await comprehensiveAnalysis(imagePath);
      } catch (error) {
        console.error('Vision analysis failed:', error.message);
        // Continue without vision data
      }
    }

    // Lookup barcode if provided
    if (barcode) {
      try {
        const barcodeResult = await lookupBarcode(barcode);
        if (barcodeResult.found) {
          barcodeData = barcodeResult.data;
        }
      } catch (error) {
        console.error('Barcode lookup failed:', error.message);
        // Continue without barcode data
      }
    }

    // Use Gemini to identify the item
    let itemInfo;
    if (barcodeData) {
      // If we have barcode data, enhance it with vision data
      itemInfo = await enhanceWithBarcode({ barcode, type: barcodeData.barcode_type }, visionData);
    } else {
      // Otherwise use description and vision data
      itemInfo = await identifyItem(description, visionData);
    }

    res.json({
      success: true,
      item: {
        name: itemInfo.name,
        description: itemInfo.description,
        category: itemInfo.category,
        brand: itemInfo.brand || null,
        confidence: itemInfo.confidence,
        ai_identified: true,
        image_path: req.file ? `/uploads/${req.file.filename}` : null,
        barcode: barcode || null,
        barcode_type: barcodeData?.barcode_type || null
      },
      vision_data: visionData,
      barcode_data: barcodeData
    });
  } catch (error) {
    console.error('Item identification error:', error);
    res.status(500).json({ 
      error: 'Failed to identify item',
      details: error.message 
    });
  }
};

// Suggest optimal placement for an item
export const suggestItemPlacement = async (req, res) => {
  try {
    const { item_name, item_description, item_category } = req.body;

    if (!item_name) {
      return res.status(400).json({ error: 'Item name is required' });
    }

    // Get user's locations and containers
    const locations = await getAll(
      'SELECT id, name, description FROM locations WHERE user_id = ?',
      [req.user.id]
    );

    const containers = await getAll(
      `SELECT c.id, c.name, c.description, l.name as location_name 
       FROM containers c
       LEFT JOIN locations l ON c.location_id = l.id
       WHERE c.user_id = ?`,
      [req.user.id]
    );

    if (locations.length === 0 && containers.length === 0) {
      return res.status(400).json({ 
        error: 'No locations or containers found. Please create some storage locations first.' 
      });
    }

    // Get AI suggestion
    const suggestion = await suggestPlacement(
      {
        name: item_name,
        description: item_description,
        category: item_category
      },
      locations,
      containers
    );

    res.json({
      success: true,
      suggestion: {
        location_id: suggestion.suggested_location_id,
        container_id: suggestion.suggested_container_id,
        reasoning: suggestion.reasoning,
        alternatives: suggestion.alternatives || []
      },
      available_locations: locations,
      available_containers: containers
    });
  } catch (error) {
    console.error('Placement suggestion error:', error);
    res.status(500).json({ 
      error: 'Failed to suggest placement',
      details: error.message 
    });
  }
};

// Process natural language query
export const handleNaturalLanguageQuery = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Get user's inventory context
    const items = await getAll(
      'SELECT id, name, category_id FROM items WHERE user_id = ? LIMIT 100',
      [req.user.id]
    );

    const categories = await getAll(
      'SELECT id, name FROM categories WHERE user_id = ?',
      [req.user.id]
    );

    const locations = await getAll(
      'SELECT id, name FROM locations WHERE user_id = ?',
      [req.user.id]
    );

    // Process query with AI
    const result = await processQuery(query, {
      items,
      categories,
      locations
    });

    res.json({
      success: true,
      query: query,
      answer: result.answer,
      confidence: result.confidence,
      context: {
        total_items: items.length,
        total_categories: categories.length,
        total_locations: locations.length
      }
    });
  } catch (error) {
    console.error('Query processing error:', error);
    res.status(500).json({ 
      error: 'Failed to process query',
      details: error.message 
    });
  }
};

// Analyze image only (without item creation)
export const analyzeImageOnly = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const imagePath = path.join(__dirname, '..', req.file.path);

    // Perform comprehensive analysis
    const analysis = await comprehensiveAnalysis(imagePath);

    res.json({
      success: true,
      analysis: {
        labels: analysis.labels,
        objects: analysis.objects,
        text: analysis.text,
        logos: analysis.logos,
        colors: analysis.dominantColors
      },
      image_path: `/uploads/${req.file.filename}`
    });
  } catch (error) {
    console.error('Image analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze image',
      details: error.message 
    });
  }
};

// Made with Bob
