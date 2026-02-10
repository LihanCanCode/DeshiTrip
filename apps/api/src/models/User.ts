import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    passwordHash: string;
    avatar?: string;
    role: 'user' | 'admin';
    xp: number;
    bio?: string;
    displayName?: string;
    badges: {
        name: string;
        icon: string;
        description: string;
        earnedAt: Date;
        groupId?: string;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        passwordHash: { type: String, required: true },
        avatar: { type: String },
        role: { type: String, enum: ['user', 'admin'], default: 'user' },
        xp: { type: Number, default: 0 },
        bio: { type: String, default: '' },
        displayName: { type: String, default: '' },
        badges: [
            {
                name: { type: String, required: true },
                icon: { type: String, required: true },
                description: { type: String, required: true },
                earnedAt: { type: Date, default: Date.now },
                groupId: { type: String }
            },
        ],
    },
    { timestamps: true }
);

export const User = model<IUser>('User', userSchema);
