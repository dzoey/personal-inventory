import express from 'express';
import {
  getAllLocations,
  getLocation,
  createLocation,
  updateLocation,
  deleteLocation
} from '../controllers/locationsController.js';
import { authenticateToken } from '../middleware/auth.js';
import { uploadSingle, handleUploadError } from '../middleware/upload.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Location routes
router.get('/', getAllLocations);
router.get('/:id', getLocation);
router.post('/', uploadSingle, handleUploadError, createLocation);
router.put('/:id', uploadSingle, handleUploadError, updateLocation);
router.delete('/:id', deleteLocation);

export default router;

// Made with Bob
