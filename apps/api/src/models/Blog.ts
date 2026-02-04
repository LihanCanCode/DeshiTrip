import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBlog extends Document {
    author: Types.ObjectId;
    content: string;
    images: string[];
    spotName: string;
    likes: Types.ObjectId[];
    comments: {
        user: Types.ObjectId;
        text: string;
        createdAt: Date;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

const BlogSchema: Schema = new Schema({
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    images: [{ type: String }],
    spotName: { type: String, required: true, index: true }, // Indexed for filtering
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    comments: [
        {
            user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
            text: { type: String, required: true },
            createdAt: { type: Date, default: Date.now }
        }
    ]
}, { timestamps: true });

export default mongoose.model<IBlog>('Blog', BlogSchema);
