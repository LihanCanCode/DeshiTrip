import { Router } from 'express';
import { createBlog, getBlogs, likeBlog, commentBlog } from '../controllers/blogController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Public: Read blogs
router.get('/', getBlogs);

// Protected: Create, Like, Comment
router.post('/', authMiddleware, createBlog);
router.post('/:id/like', authMiddleware, likeBlog);
router.post('/:id/comment', authMiddleware, commentBlog);

export default router;
