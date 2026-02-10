import { Router } from 'express';
import { triggerSOS, resolveAlert, getActiveAlerts } from '../controllers/alertController';
import { authMiddleware } from '../middleware/authMiddleware';

const router: Router = Router();

router.use(authMiddleware);

router.post('/sos', triggerSOS);
router.get('/active', getActiveAlerts);
router.patch('/:id/resolve', resolveAlert);

export default router;
