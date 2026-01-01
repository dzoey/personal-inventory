import express from 'express';
import {
  getAllContainers,
  getContainer,
  createContainer,
  updateContainer,
  deleteContainer,
  getContainerByBarcode
} from '../controllers/containersController.js';
import { authenticateToken } from '../middleware/auth.js';
import { uploadSingle, handleUploadError } from '../middleware/upload.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Container routes
router.get('/', getAllContainers);
router.get('/barcode/:barcode', getContainerByBarcode);
router.get('/:id', getContainer);
router.post('/', uploadSingle, handleUploadError, createContainer);
router.put('/:id', uploadSingle, handleUploadError, updateContainer);
router.delete('/:id', deleteContainer);

export default router;

// Made with Bob
