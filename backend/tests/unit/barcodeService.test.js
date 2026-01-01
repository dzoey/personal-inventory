import {
  validateBarcode,
  calculateCheckDigit,
  verifyCheckDigit,
  parseBarcodeData,
  suggestBarcodes
} from '../../services/barcodeService.js';

describe('Barcode Service', () => {
  describe('validateBarcode', () => {
    it('should validate EAN-13 barcode', () => {
      const result = validateBarcode('1234567890123');
      
      expect(result.valid).toBe(true);
      expect(result.format).toBe('EAN-13');
    });

    it('should validate UPC-A barcode', () => {
      const result = validateBarcode('123456789012');
      
      expect(result.valid).toBe(true);
      expect(result.format).toBe('UPC-A');
    });

    it('should validate EAN-8 barcode', () => {
      const result = validateBarcode('12345678');
      
      expect(result.valid).toBe(true);
      expect(result.format).toBe('EAN-8');
    });

    it('should reject invalid barcode', () => {
      const result = validateBarcode('invalid');
      
      expect(result.valid).toBe(false);
      expect(result.format).toBe(null);
    });

    it('should handle empty barcode', () => {
      const result = validateBarcode('');
      
      expect(result.valid).toBe(false);
    });
  });

  describe('calculateCheckDigit', () => {
    it('should calculate correct check digit for EAN-13', () => {
      const checkDigit = calculateCheckDigit('978014300723');
      
      expect(checkDigit).toBe(2);
    });

    it('should calculate correct check digit for UPC-A', () => {
      const checkDigit = calculateCheckDigit('03600029145');
      
      expect(checkDigit).toBe(2);
    });

    it('should handle numeric strings', () => {
      const checkDigit = calculateCheckDigit('123456789012');
      
      expect(typeof checkDigit).toBe('number');
      expect(checkDigit).toBeGreaterThanOrEqual(0);
      expect(checkDigit).toBeLessThanOrEqual(9);
    });
  });

  describe('verifyCheckDigit', () => {
    it('should verify valid EAN-13 barcode', () => {
      const result = verifyCheckDigit('9780143007234');
      
      expect(result.valid).toBe(true);
    });

    it('should detect invalid check digit', () => {
      const result = verifyCheckDigit('9780143007235');
      
      expect(result.valid).toBe(false);
    });

    it('should reject invalid length', () => {
      const result = verifyCheckDigit('12345');
      
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('parseBarcodeData', () => {
    it('should parse barcode from scan result object', () => {
      const scanResult = {
        codeResult: {
          code: '123456789012',
          format: 'EAN-13'
        }
      };
      
      const result = parseBarcodeData(scanResult);
      
      expect(result.barcode).toBe('123456789012');
      expect(result.format).toBe('EAN-13');
      expect(result.valid).toBe(true);
      expect(result.timestamp).toBeDefined();
    });

    it('should parse barcode from string', () => {
      const result = parseBarcodeData('123456789012');
      
      expect(result.barcode).toBe('123456789012');
      expect(result.valid).toBe(true);
    });

    it('should handle invalid barcode', () => {
      const result = parseBarcodeData('invalid');
      
      expect(result.valid).toBe(false);
    });

    it('should handle errors gracefully', () => {
      const result = parseBarcodeData(null);
      
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('suggestBarcodes', () => {
    it('should suggest UPC-A for short input', () => {
      const suggestions = suggestBarcodes('12345');
      
      expect(suggestions).toContainEqual(
        expect.objectContaining({ format: 'UPC-A', length: 12 })
      );
    });

    it('should suggest EAN-13 for medium input', () => {
      const suggestions = suggestBarcodes('123456789');
      
      expect(suggestions).toContainEqual(
        expect.objectContaining({ format: 'EAN-13', length: 13 })
      );
    });

    it('should suggest EAN-8 for very short input', () => {
      const suggestions = suggestBarcodes('123');
      
      expect(suggestions).toContainEqual(
        expect.objectContaining({ format: 'EAN-8', length: 8 })
      );
    });

    it('should return empty array for complete barcode', () => {
      const suggestions = suggestBarcodes('1234567890123');
      
      expect(suggestions).toHaveLength(0);
    });

    it('should calculate remaining digits', () => {
      const suggestions = suggestBarcodes('12345');
      const upcSuggestion = suggestions.find(s => s.format === 'UPC-A');
      
      expect(upcSuggestion.remaining).toBe(7);
    });
  });
});

// Made with Bob
