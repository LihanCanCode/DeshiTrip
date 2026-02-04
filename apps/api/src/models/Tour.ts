import { Schema, model, Document, Types } from 'mongoose';

export interface ITour extends Document {
    group: Types.ObjectId;
    startDate: Date;
    endDate: Date;
    destination: string;
    itinerary: {
        day: number;
        date: Date;
        spots: Types.ObjectId[];
        notes?: string;
    }[];
    budget: number;
    status: 'planned' | 'ongoing' | 'completed';
    createdAt: Date;
    updatedAt: Date;
}

const tourSchema = new Schema<ITour>(
    {
        group: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        destination: { type: String, required: true },
        itinerary: [
            {
                day: { type: Number, required: true },
                date: { type: Date, required: true },
                spots: [{ type: Schema.Types.ObjectId, ref: 'Spot' }],
                notes: { type: String },
            },
        ],
        budget: { type: Number, default: 0 },
        status: { type: String, enum: ['planned', 'ongoing', 'completed'], default: 'planned' },
    },
    { timestamps: true }
);

export const Tour = model<ITour>('Tour', tourSchema);
