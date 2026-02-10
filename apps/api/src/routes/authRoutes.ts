import { Router } from 'express';
import { register, login, getMe, updateProfile, updateAvatar } from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';
import { upload } from '../middleware/uploadMiddleware';

const router: Router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getMe);
router.put('/profile', authMiddleware, updateProfile);
router.post('/upload-avatar', authMiddleware, upload.single('avatar'), updateAvatar);

export default router;
