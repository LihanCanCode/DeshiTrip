import { Request, Response } from 'express';
import Blog from '../models/Blog';

interface AuthRequest extends Request {
    user?: any;
}

// Create a new blog post
export const createBlog = async (req: AuthRequest, res: Response) => {
    try {
        const { content, spotName, images } = req.body;

        if (!content || !spotName) {
            return res.status(400).json({ message: 'Content and Spot Name are required' });
        }

        const blog = new Blog({
            author: req.user.id,
            content,
            spotName,
            images: images || [],
        });

        const savedBlog = await blog.save();
        // Populate author immediately for frontend
        await savedBlog.populate('author', 'name email');

        res.status(201).json(savedBlog);
    } catch (error) {
        res.status(500).json({ message: 'Error creating blog post', error });
    }
};

// Get all blogs (optional filter by spotName)
export const getBlogs = async (req: Request, res: Response) => {
    try {
        const { spot } = req.query;
        let query = {};

        if (spot) {
            // Case-insensitive search for spot name
            query = { spotName: { $regex: spot, $options: 'i' } };
        }

        const blogs = await Blog.find(query)
            .populate('author', 'name email')
            .populate('comments.user', 'name')
            .sort({ createdAt: -1 }); // Newest first

        res.status(200).json(blogs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching blogs', error });
    }
};

// Toggle Like
export const likeBlog = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const blog = await Blog.findById(id);
        if (!blog) return res.status(404).json({ message: 'Blog not found' });

        const isLiked = blog.likes.includes(userId);

        if (isLiked) {
            // Unlike
            blog.likes = blog.likes.filter(id => id.toString() !== userId);
        } else {
            // Like
            blog.likes.push(userId);
        }

        await blog.save();
        res.status(200).json(blog);
    } catch (error) {
        res.status(500).json({ message: 'Error liking blog', error });
    }
};

// Add Comment
export const commentBlog = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { text } = req.body;
        const userId = req.user.id;

        if (!text) return res.status(400).json({ message: 'Comment text is required' });

        const blog = await Blog.findById(id);
        if (!blog) return res.status(404).json({ message: 'Blog not found' });

        const newComment = {
            user: userId,
            text,
            createdAt: new Date()
        };

        blog.comments.push(newComment);
        await blog.save();

        // Populate specific fields to return updated blog
        await blog.populate('comments.user', 'name');

        res.status(201).json(blog);
    } catch (error) {
        res.status(500).json({ message: 'Error adding comment', error });
    }
};
