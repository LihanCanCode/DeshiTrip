import { Request, Response } from 'express';
import { Spot } from '../models/Spot';
import { calculateDistance, calculateTravelTime } from '../utils/routeUtils';

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

/**
 * Geocode location names to coordinates
 * POST /api/spots/geocode
 * Body: { locations: [{ day: 1, name: "Cox's Bazar" }] }
 */
export const geocodeSpots = async (req: Request, res: Response) => {
    try {
        const { locations } = req.body;

        if (!locations || !Array.isArray(locations)) {
            return res.status(400).json({
                success: false,
                message: 'locations array is required'
            });
        }

        const geocodedLocations = [];

        for (const loc of locations) {
            // Try to find exact match first
            let spot = await Spot.findOne({
                $or: [
                    { 'name.en': new RegExp(loc.name, 'i') },
                    { 'name.bn': new RegExp(loc.name, 'i') }
                ]
            });

            if (spot) {
                geocodedLocations.push({
                    day: loc.day,
                    name: loc.name,
                    coordinates: spot.location.coordinates,
                    spotId: spot._id,
                    found: true
                });
            } else {
                // If not found, return null coordinates
                geocodedLocations.push({
                    day: loc.day,
                    name: loc.name,
                    coordinates: null,
                    found: false
                });
            }
        }

        // Calculate distances between consecutive days
        const routes = [];
        for (let i = 0; i < geocodedLocations.length - 1; i++) {
            const current = geocodedLocations[i];
            const next = geocodedLocations[i + 1];

            if (current.coordinates && next.coordinates) {
                const [lon1, lat1] = current.coordinates;
                const [lon2, lat2] = next.coordinates;

                const distance = calculateDistance(lat1, lon1, lat2, lon2);
                const travelTime = calculateTravelTime(distance);

                routes.push({
                    from: current.name,
                    to: next.name,
                    fromDay: current.day,
                    toDay: next.day,
                    distance: `${distance} km`,
                    estimatedTime: `${travelTime}h`
                });
            }
        }

        res.json({
            success: true,
            locations: geocodedLocations,
            routes
        });
    } catch (error: any) {
        console.error('Geocoding error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
