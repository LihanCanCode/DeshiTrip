import { Schema, model, Document, Types } from 'mongoose';

export interface IGroup extends Document {
    name: string;
    description?: string;
    admin: Types.ObjectId;
    members: Types.ObjectId[];
    guests: {
        name: string;
        addedBy: Types.ObjectId;
    }[];
    inviteCode: string;
    avatar?: string;
    coverImage?: string;
    memoryNote?: string;
    milestones?: string;
    foodieStat?: string;
    status: 'active' | 'finished';
    finishedAt?: Date;
    destination: string;
    createdAt: Date;
    updatedAt: Date;
}

const groupSchema = new Schema<IGroup>(
    {
        name: { type: String, required: true },
        description: { type: String },
        admin: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        guests: [
            {
                name: { type: String, required: true },
                addedBy: { type: Schema.Types.ObjectId, ref: 'User' },
            },
        ],
        inviteCode: { type: String, unique: true, required: true },
        avatar: { type: String },
        coverImage: { type: String, default: '' },
        memoryNote: { type: String, default: '' },
        milestones: { type: String, default: '' },
        foodieStat: { type: String, default: '' },
        status: { type: String, enum: ['active', 'finished'], default: 'active' },
        finishedAt: { type: Date },
        destination: { type: String, default: '' },
    },
    { timestamps: true }
);

export const Group = model<IGroup>('Group', groupSchema);
