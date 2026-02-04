import { Request, Response } from 'express';

export const uploadImage = (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        // @ts-ignore
        const imageUrl = req.file.path; // Cloudinary URL
        res.status(200).json({ url: imageUrl });
    } catch (error) {
        res.status(500).json({ message: 'Upload failed', error });
    }
};
