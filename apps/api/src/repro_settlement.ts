import mongoose from 'mongoose';
import { Expense } from './models/Expense';
import { Group } from './models/Group';
import dotenv from 'dotenv';
import { Types } from 'mongoose';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/deshitrip';

const run = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Create a dummy group ID (doesn't check existence for expense save usually, unless populated validation)
        const groupId = new Types.ObjectId();
        const userId = new Types.ObjectId();

        console.log('Attempting to save settlement expense...');

        const expense = new Expense({
            group: groupId,
            // paidBy skipped (undefined)
            payerGuestName: 'TestGuest',
            type: 'Settlement',
            amount: 500,
            description: 'Settlement Test',
            category: 'Settlement',
            splitBetween: [
                {
                    user: userId,
                    amount: 500
                }
            ]
        });

        await expense.save();
        console.log('Validation successful! Expense saved:', expense._id);

    } catch (error: any) {
        console.error('Validation FAILED:', error.message);
        if (error.errors) {
            console.error('Details:', error.errors);
        }
    } finally {
        await mongoose.disconnect();
    }
};

run();
