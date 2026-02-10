import { Router } from 'express';
import { getGroupActivities } from '../controllers/activityController';
import { authMiddleware } from '../middleware/authMiddleware';

const router: Router = Router();

router.use(authMiddleware);

router.get('/group/:groupId', getGroupActivities);

export default router;
