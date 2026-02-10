import { Schema, model, Document, Types } from 'mongoose';

export interface IActivity extends Document {
    group: Types.ObjectId;
    userId?: Types.ObjectId;
    userName: string;
    type: 'EXPENSE_ADDED' | 'MEMBER_JOINED' | 'SETTLEMENT_RECORDED' | 'MEMORY_UPDATED';
    description: string;
    amount?: number;
    category?: string;
    createdAt: Date;
}

const activitySchema = new Schema<IActivity>(
    {
        group: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        userName: { type: String, required: true },
        type: {
            type: String,
            enum: ['EXPENSE_ADDED', 'MEMBER_JOINED', 'SETTLEMENT_RECORDED', 'MEMORY_UPDATED'],
            required: true
        },
        description: { type: String, required: true },
        amount: { type: Number },
        category: { type: String },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

// Index for fast retrieval of group activities
activitySchema.index({ group: 1, createdAt: -1 });

export const Activity = model<IActivity>('Activity', activitySchema);
