
import mongoose from 'mongoose';
import { Expense } from './models/Expense';
import { Group } from './models/Group';
import dotenv from 'dotenv';

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log('Connected to MongoDB');

        // Create dummy IDs
        const userId = new mongoose.Types.ObjectId();
        const groupId = new mongoose.Types.ObjectId();

        const expense = new Expense({
            group: groupId,
            paidBy: userId,
            amount: 300,
            description: 'Test Expense',
            category: 'Food',
            splitBetween: [
                {
                    user: userId,
                    amount: 150
                },
                {
                    guestName: 'Guest1',
                    amount: 150
                }
            ]
        });

        console.log('Attempting to save expense...');
        await expense.validate();
        console.log('Validation successful!');
    } catch (error: any) {
        console.error('Validation Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

run();
