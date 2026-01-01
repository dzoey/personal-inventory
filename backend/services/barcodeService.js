import axios from 'axios';

// Lookup product information from barcode using external APIs
export const lookupBarcode = async (barcode) => {
  try {
    // Try multiple barcode lookup services
    
    // Option 1: Open Food Facts (for food products)
    if (barcode.length === 13 || barcode.length === 8) {
      try {
        const response = await axios.get(
          `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
          { timeout: 5000 }
        );

        if (response.data.status === 1) {
          const product = response.data.product;
          return {
            found: true,
            source: 'Open Food Facts',
            data: {
              name: product.product_name || product.product_name_en,
              brand: product.brands,
              category: product.categories,
              description: product.generic_name || product.product_name,
              image_url: product.image_url,
              barcode: barcode,
              barcode_type: barcode.length === 13 ? 'EAN-13' : 'EAN-8'
            }
          };
        }
      } catch (error) {
        console.log('Open Food Facts lookup failed:', error.message);
      }
    }

    // Option 2: UPC Item DB (requires API key - optional)
    if (process.env.UPCITEMDB_API_KEY) {
      try {
        const response = await axios.get(
          `https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`,
          {
            headers: {
              'user_key': process.env.UPCITEMDB_API_KEY,
              'key_type': '3scale'
            },
            timeout: 5000
          }
        );

        if (response.data.items && response.data.items.length > 0) {
          const item = response.data.items[0];
          return {
            found: true,
            source: 'UPC Item DB',
            data: {
              name: item.title,
              brand: item.brand,
              category: item.category,
              description: item.description,
              image_url: item.images?.[0],
              barcode: barcode,
              barcode_type: 'UPC'
            }
          };
        }
      } catch (error) {
        console.log('UPC Item DB lookup failed:', error.message);
      }
    }

    // Option 3: Barcode Lookup (free tier available)
    try {
      const response = await axios.get(
        `https://api.barcodelookup.com/v3/products?barcode=${barcode}&formatted=y&key=${process.env.BARCODE_LOOKUP_API_KEY || 'demo'}`,
        { timeout: 5000 }
      );

      if (response.data.products && response.data.products.length > 0) {
        const product = response.data.products[0];
        return {
          found: true,
          source: 'Barcode Lookup',
          data: {
            name: product.title || product.product_name,
            brand: product.brand,
            category: product.category,
            description: product.description,
            image_url: product.images?.[0],
            barcode: barcode,
            barcode_type: product.barcode_type
          }
        };
      }
    } catch (error) {
      console.log('Barcode Lookup failed:', error.message);
    }

    // No product found in any database
    return {
      found: false,
      barcode: barcode,
      message: 'Product not found in barcode databases'
    };
  } catch (error) {
    console.error('Barcode lookup error:', error);
    throw new Error(`Failed to lookup barcode: ${error.message}`);
  }
};

// Validate barcode format
export const validateBarcode = (barcode) => {
  const barcodeStr = String(barcode).trim();
  
  // Common barcode formats
  const formats = {
    'UPC-A': /^\d{12}$/,
    'UPC-E': /^\d{8}$/,
    'EAN-13': /^\d{13}$/,
    'EAN-8': /^\d{8}$/,
    'Code-39': /^[A-Z0-9\-\.\ \$\/\+\%]+$/,
    'Code-128': /^[\x00-\x7F]+$/,
    'ITF': /^\d+$/
  };

  for (const [format, pattern] of Object.entries(formats)) {
    if (pattern.test(barcodeStr)) {
      return {
        valid: true,
        format: format,
        barcode: barcodeStr
      };
    }
  }

  return {
    valid: false,
    format: null,
    barcode: barcodeStr,
    error: 'Invalid barcode format'
  };
};

// Calculate check digit for EAN/UPC barcodes
export const calculateCheckDigit = (barcode) => {
  const digits = String(barcode).split('').map(Number);
  let sum = 0;

  // For EAN-13 and UPC-A
  for (let i = 0; i < digits.length - 1; i++) {
    sum += digits[i] * (i % 2 === 0 ? 1 : 3);
  }

  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit;
};

// Verify barcode check digit
export const verifyCheckDigit = (barcode) => {
  const barcodeStr = String(barcode);
  
  if (barcodeStr.length !== 13 && barcodeStr.length !== 12) {
    return { valid: false, error: 'Invalid barcode length for check digit verification' };
  }

  const providedCheckDigit = parseInt(barcodeStr[barcodeStr.length - 1]);
  const calculatedCheckDigit = calculateCheckDigit(barcodeStr);

  return {
    valid: providedCheckDigit === calculatedCheckDigit,
    provided: providedCheckDigit,
    calculated: calculatedCheckDigit
  };
};

// Parse barcode data from scan result
export const parseBarcodeData = (scanResult) => {
  try {
    const barcode = scanResult.codeResult?.code || scanResult.code || scanResult;
    const format = scanResult.codeResult?.format || scanResult.format || 'unknown';

    const validation = validateBarcode(barcode);

    return {
      barcode: barcode,
      format: format,
      valid: validation.valid,
      normalized: validation.barcode,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Barcode parsing error:', error);
    return {
      barcode: null,
      format: 'unknown',
      valid: false,
      error: error.message
    };
  }
};

// Generate barcode suggestions based on partial input
export const suggestBarcodes = (partial) => {
  const suggestions = [];
  const partialStr = String(partial);

  // Suggest completing to common formats
  if (partialStr.length < 12) {
    suggestions.push({
      format: 'UPC-A',
      length: 12,
      remaining: 12 - partialStr.length
    });
  }

  if (partialStr.length < 13) {
    suggestions.push({
      format: 'EAN-13',
      length: 13,
      remaining: 13 - partialStr.length
    });
  }

  if (partialStr.length < 8) {
    suggestions.push({
      format: 'EAN-8',
      length: 8,
      remaining: 8 - partialStr.length
    });
  }

  return suggestions;
};

export default {
  lookupBarcode,
  validateBarcode,
  calculateCheckDigit,
  verifyCheckDigit,
  parseBarcodeData,
  suggestBarcodes
};

// Made with Bob
