import express from 'express';
import {
  getAllItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  getItemByBarcode
} from '../controllers/itemsController.js';
import { authenticateToken } from '../middleware/auth.js';
import { uploadSingle, handleUploadError } from '../middleware/upload.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Item routes
router.get('/', getAllItems);
router.get('/barcode/:barcode', getItemByBarcode);
router.get('/:id', getItem);
router.post('/', uploadSingle, handleUploadError, createItem);
router.put('/:id', uploadSingle, handleUploadError, updateItem);
router.delete('/:id', deleteItem);

export default router;

// Made with Bob
