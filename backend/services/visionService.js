import vision from '@google-cloud/vision';
import fs from 'fs';
import path from 'path';

// Initialize Vision API client
let visionClient = null;

const initVisionClient = () => {
  if (!visionClient) {
    try {
      // Check if credentials are configured
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        visionClient = new vision.ImageAnnotatorClient();
        console.log('Google Cloud Vision API initialized');
      } else {
        console.warn('Google Cloud Vision API credentials not configured');
      }
    } catch (error) {
      console.error('Failed to initialize Vision API:', error.message);
    }
  }
  return visionClient;
};

// Analyze image for labels and objects
export const analyzeImage = async (imagePath) => {
  const client = initVisionClient();
  
  if (!client) {
    throw new Error('Vision API not configured');
  }

  try {
    // Read image file
    const imageBuffer = fs.readFileSync(imagePath);

    // Perform label detection
    const [labelResult] = await client.labelDetection(imageBuffer);
    const labels = labelResult.labelAnnotations || [];

    // Perform object detection
    const [objectResult] = await client.objectLocalization(imageBuffer);
    const objects = objectResult.localizedObjectAnnotations || [];

    // Perform text detection (for barcodes, labels, etc.)
    const [textResult] = await client.textDetection(imageBuffer);
    const texts = textResult.textAnnotations || [];

    // Perform logo detection
    const [logoResult] = await client.logoDetection(imageBuffer);
    const logos = logoResult.logoAnnotations || [];

    return {
      labels: labels.map(label => ({
        description: label.description,
        score: label.score,
        confidence: Math.round(label.score * 100)
      })),
      objects: objects.map(obj => ({
        name: obj.name,
        score: obj.score,
        confidence: Math.round(obj.score * 100)
      })),
      texts: texts.map(text => ({
        description: text.description,
        confidence: text.confidence ? Math.round(text.confidence * 100) : null
      })),
      logos: logos.map(logo => ({
        description: logo.description,
        score: logo.score
      }))
    };
  } catch (error) {
    console.error('Vision API error:', error);
    throw new Error(`Failed to analyze image: ${error.message}`);
  }
};

// Detect barcodes in image
export const detectBarcodes = async (imagePath) => {
  const client = initVisionClient();
  
  if (!client) {
    throw new Error('Vision API not configured');
  }

  try {
    const imageBuffer = fs.readFileSync(imagePath);

    // Perform barcode detection
    const [result] = await client.textDetection(imageBuffer);
    const detections = result.textAnnotations || [];

    // Also try explicit barcode detection if available
    let barcodes = [];
    try {
      const [barcodeResult] = await client.annotateImage({
        image: { content: imageBuffer },
        features: [{ type: 'BARCODE_DETECTION' }]
      });
      
      if (barcodeResult.barcodeAnnotations) {
        barcodes = barcodeResult.barcodeAnnotations.map(barcode => ({
          format: barcode.format,
          value: barcode.rawValue,
          type: barcode.format
        }));
      }
    } catch (err) {
      console.log('Barcode detection not available, using text detection');
    }

    return {
      barcodes,
      texts: detections.slice(0, 5).map(text => text.description)
    };
  } catch (error) {
    console.error('Barcode detection error:', error);
    throw new Error(`Failed to detect barcodes: ${error.message}`);
  }
};

// Get dominant colors from image
export const getImageColors = async (imagePath) => {
  const client = initVisionClient();
  
  if (!client) {
    throw new Error('Vision API not configured');
  }

  try {
    const imageBuffer = fs.readFileSync(imagePath);

    const [result] = await client.imageProperties(imageBuffer);
    const colors = result.imagePropertiesAnnotation?.dominantColors?.colors || [];

    return colors.map(color => ({
      red: color.color.red || 0,
      green: color.color.green || 0,
      blue: color.color.blue || 0,
      score: color.score,
      pixelFraction: color.pixelFraction
    }));
  } catch (error) {
    console.error('Color detection error:', error);
    throw new Error(`Failed to detect colors: ${error.message}`);
  }
};

// Comprehensive image analysis
export const comprehensiveAnalysis = async (imagePath) => {
  const client = initVisionClient();
  
  if (!client) {
    throw new Error('Vision API not configured');
  }

  try {
    const imageBuffer = fs.readFileSync(imagePath);

    // Perform multiple detections in one request
    const [result] = await client.annotateImage({
      image: { content: imageBuffer },
      features: [
        { type: 'LABEL_DETECTION', maxResults: 10 },
        { type: 'OBJECT_LOCALIZATION', maxResults: 10 },
        { type: 'TEXT_DETECTION' },
        { type: 'LOGO_DETECTION' },
        { type: 'IMAGE_PROPERTIES' }
      ]
    });

    return {
      labels: (result.labelAnnotations || []).map(label => ({
        description: label.description,
        confidence: Math.round(label.score * 100)
      })),
      objects: (result.localizedObjectAnnotations || []).map(obj => ({
        name: obj.name,
        confidence: Math.round(obj.score * 100)
      })),
      text: result.textAnnotations?.[0]?.description || null,
      logos: (result.logoAnnotations || []).map(logo => logo.description),
      dominantColors: (result.imagePropertiesAnnotation?.dominantColors?.colors || [])
        .slice(0, 3)
        .map(color => ({
          red: color.color.red || 0,
          green: color.color.green || 0,
          blue: color.color.blue || 0
        }))
    };
  } catch (error) {
    console.error('Comprehensive analysis error:', error);
    throw new Error(`Failed to analyze image: ${error.message}`);
  }
};

export default {
  analyzeImage,
  detectBarcodes,
  getImageColors,
  comprehensiveAnalysis
};

// Made with Bob
