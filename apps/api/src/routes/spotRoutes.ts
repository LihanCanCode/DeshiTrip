import { Router } from 'express';
import { getSpots, getSpotById, getRecommendedSpots } from '../controllers/spotController';

const router: Router = Router();

router.get('/', getSpots);
router.get('/recommend', getRecommendedSpots);
router.get('/:id', getSpotById);

export default router;
