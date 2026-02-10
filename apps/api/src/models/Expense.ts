import { Schema, model, Document, Types } from 'mongoose';

export interface IExpense extends Document {
    group: Types.ObjectId;
    paidBy?: Types.ObjectId;
    payerGuestName?: string;
    type: 'Expense' | 'Settlement';
    amount: number;
    description: string;
    category: string;
    isAutoSplit: boolean;
    splitBetween: {
        user?: Types.ObjectId;
        guestName?: string;
        amount: number;
    }[];
    date: Date;
    createdAt: Date;
    updatedAt: Date;
}

const expenseSchema = new Schema<IExpense>(
    {
        group: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
        paidBy: { type: Schema.Types.ObjectId, ref: 'User', required: false }, // Made optional
        payerGuestName: { type: String }, // New field for guest payers
        type: { type: String, enum: ['Expense', 'Settlement'], default: 'Expense' }, // New field
        amount: { type: Number, required: true },
        description: { type: String, required: true },
        category: { type: String, default: 'General' },
        isAutoSplit: { type: Boolean, default: true },
        splitBetween: [
            {
                user: { type: Schema.Types.ObjectId, ref: 'User' },
                guestName: { type: String },
                amount: { type: Number, required: true },
            },
        ],
        date: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

export const Expense = model<IExpense>('Expense', expenseSchema);
