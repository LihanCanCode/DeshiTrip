import { Schema, model, Document } from 'mongoose';

export interface ISpot extends Document {
    name: {
        en: string;
        bn: string;
    };
    description: {
        en: string;
        bn: string;
    };
    district: string;
    location: {
        type: 'Point';
        coordinates: [number, number]; // [longitude, latitude]
    };
    images: string[];
    tags: string[];
    averageCost: number;
    bestSeason: string[];
    createdAt: Date;
    updatedAt: Date;
}

const spotSchema = new Schema<ISpot>(
    {
        name: {
            en: { type: String, required: true },
            bn: { type: String, required: true },
        },
        description: {
            en: { type: String, required: true },
            bn: { type: String, required: true },
        },
        district: { type: String, required: true },
        location: {
            type: { type: String, enum: ['Point'], default: 'Point' },
            coordinates: { type: [Number], required: true },
        },
        images: [{ type: String }],
        tags: [{ type: String }],
        averageCost: { type: Number, default: 0 },
        bestSeason: [{ type: String }],
    },
    { timestamps: true }
);

spotSchema.index({ location: '2dsphere' });

export const Spot = model<ISpot>('Spot', spotSchema);
