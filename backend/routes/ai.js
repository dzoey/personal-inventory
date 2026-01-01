import express from 'express';
import {
  identifyItemFromInput,
  suggestItemPlacement,
  handleNaturalLanguageQuery,
  analyzeImageOnly
} from '../controllers/aiController.js';
import { authenticateToken } from '../middleware/auth.js';
import { uploadSingle, handleUploadError } from '../middleware/upload.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// AI routes
router.post('/identify-item', uploadSingle, handleUploadError, identifyItemFromInput);
router.post('/suggest-placement', suggestItemPlacement);
router.post('/query', handleNaturalLanguageQuery);
router.post('/analyze-image', uploadSingle, handleUploadError, analyzeImageOnly);

export default router;

// Made with Bob
