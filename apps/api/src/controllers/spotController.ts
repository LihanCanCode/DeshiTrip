import { Request, Response } from 'express';
import { Spot } from '../models/Spot';

export const getSpots = async (req: Request, res: Response) => {
    try {
        const { district, tag } = req.query;
        const query: any = {};

        if (district) query.district = district;
        if (tag) query.tags = tag;

        const spots = await Spot.find(query);
        res.json(spots);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getSpotById = async (req: Request, res: Response) => {
    try {
        const spot = await Spot.findById(req.params.id);
        if (!spot) return res.status(404).json({ message: 'Spot not found' });
        res.json(spot);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getRecommendedSpots = async (req: Request, res: Response) => {
    try {
        const { district, season } = req.query;

        // In a real app, this would use a distance matrix or ML model
        // For now, we filter by season and district popularity
        const filter: any = {};
        if (district) filter.district = district;
        if (season) filter.bestSeason = { $in: [season] };

        const spots = await Spot.find(filter).sort({ averageCost: 1 }).limit(10);
        res.json(spots);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
