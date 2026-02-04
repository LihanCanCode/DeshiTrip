import { Router } from 'express';
import { upload } from '../middleware/uploadMiddleware';
import { uploadImage } from '../controllers/uploadController';

const router: Router = Router();

router.post('/', upload.single('image'), uploadImage);

export default router;
