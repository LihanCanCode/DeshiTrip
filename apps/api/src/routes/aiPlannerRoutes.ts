import express, { Router } from 'express';
import { generateTripPlan } from '../controllers/aiPlannerController';
import { authMiddleware } from '../middleware/authMiddleware';

const router: Router = express.Router();

// @route   POST /api/ai-planner/generate
// @desc    Generate AI trip plan
// @access  Private
router.post('/generate', authMiddleware, generateTripPlan);

export default router;
