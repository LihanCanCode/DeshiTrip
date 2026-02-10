import { Request, Response } from 'express';
import { User } from '../models/User';
import { hashPassword, verifyPassword, generateToken } from '../utils/auth';
import { z } from 'zod';

const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
});

export const register = async (req: Request, res: Response) => {
    try {
        const validatedData = registerSchema.parse(req.body);

        const existingUser = await User.findOne({ email: validatedData.email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const passwordHash = await hashPassword(validatedData.password);
        const user = new User({
            name: validatedData.name,
            email: validatedData.email,
            passwordHash,
        });

        await user.save();

        const token = generateToken({ id: user._id, role: user.role });
        res.status(201).json({ user: { id: user._id, name: user.name, email: user.email }, token });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.issues });
        }
        res.status(500).json({ message: error.message });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password, rememberMe } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isValid = await verifyPassword(password, user.passwordHash);
        if (!isValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(
            { id: user._id, role: user.role },
            rememberMe ? '30d' : '1d'
        );
        res.json({ user: { id: user._id, name: user.name, email: user.email }, token });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getMe = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const user = await User.findById(userId).select('-passwordHash');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateProfile = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { name, displayName, bio } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (name) user.name = name;
        if (displayName !== undefined) user.displayName = displayName;
        if (bio !== undefined) user.bio = bio;

        await user.save();
        res.json({ message: 'Profile updated successfully', user: { id: user._id, name: user.name, email: user.email, displayName: user.displayName, bio: user.bio } });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateAvatar = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const avatarUrl = (req.file as any).path; // Cloudinary URL

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.avatar = avatarUrl;
        await user.save();

        res.json({ message: 'Avatar updated successfully', avatar: avatarUrl });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
