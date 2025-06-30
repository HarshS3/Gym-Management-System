// AI suggestions route
import express from 'express';
import { getAiSuggestions } from '../controllers/ai.controller.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

// @route   POST /api/ai/suggestions
// @desc    Generate AI fitness suggestions for a member
// @access  Private
router.post('/suggestions', auth, getAiSuggestions);

export default router; 