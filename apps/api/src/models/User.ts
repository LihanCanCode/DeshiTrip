import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    passwordHash: string;
    avatar?: string;
    role: 'user' | 'admin';
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
    },
    { timestamps: true }
);

export const User = model<IUser>('User', userSchema);
