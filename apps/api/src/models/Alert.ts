import mongoose, { Schema, Document } from 'mongoose';

export interface IAlert extends Document {
    user: mongoose.Types.ObjectId;
    groups: mongoose.Types.ObjectId[];
    location: {
        type: string;
        coordinates: [number, number]; // [longitude, latitude]
    };
    message?: string;
    voiceData?: string; // Base64 audio data
    status: 'active' | 'resolved';
    createdAt: Date;
    updatedAt: Date;
}

const AlertSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    groups: [{ type: Schema.Types.ObjectId, ref: 'Group', required: true }],
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true },
    },
    message: { type: String },
    voiceData: { type: String },
    status: { type: String, enum: ['active', 'resolved'], default: 'active' },
}, {
    timestamps: true
});

AlertSchema.index({ location: '2dsphere' });

export default mongoose.model<IAlert>('Alert', AlertSchema);
