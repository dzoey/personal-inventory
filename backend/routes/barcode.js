import express from 'express';
import {
  scanBarcode,
  lookupBarcodeInfo,
  registerItemWithBarcode,
  findItemByBarcode,
  validateBarcodeFormat
} from '../controllers/barcodeController.js';
import { authenticateToken } from '../middleware/auth.js';
import { uploadSingle, handleUploadError } from '../middleware/upload.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Barcode routes
router.post('/scan', uploadSingle, handleUploadError, scanBarcode);
router.get('/lookup/:barcode', lookupBarcodeInfo);
router.post('/register', uploadSingle, handleUploadError, registerItemWithBarcode);
router.get('/find/:barcode', findItemByBarcode);
router.post('/validate', validateBarcodeFormat);

export default router;

// Made with Bob
