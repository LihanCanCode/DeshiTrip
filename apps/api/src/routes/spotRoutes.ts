import { Router } from 'express';
import { getSpots, getSpotById, getRecommendedSpots, geocodeSpots } from '../controllers/spotController';

const router: Router = Router();

router.get('/', getSpots);
router.get('/recommend', getRecommendedSpots);
router.get('/:id', getSpotById);
router.post('/geocode', geocodeSpots);

export default router;
