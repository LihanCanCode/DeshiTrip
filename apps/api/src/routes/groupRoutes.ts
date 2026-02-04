import { Router } from 'express';
import { createGroup, getGroups, joinGroup } from '../controllers/groupController';
import { authMiddleware } from '../middleware/authMiddleware';

const router: Router = Router();

router.use((req, res, next) => {
    console.log(`[groupRoutes] Incoming ${req.method} ${req.path}`);
    next();
});

router.use(authMiddleware);

router.post('/', (req, res, next) => {
    console.log('[groupRoutes] POST / triggered');
    createGroup(req, res);
});

router.get('/', (req, res, next) => {
    console.log('[groupRoutes] GET / triggered');
    getGroups(req, res);
});

router.post('/join', joinGroup);

export default router;
