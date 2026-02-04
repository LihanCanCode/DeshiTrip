import mongoose from 'mongoose';
import { Expense } from './models/Expense';
import dotenv from 'dotenv';

dotenv.config();

const run = async () => {
    // Print the schema definition for paidBy
    const paidByPath = Expense.schema.path('paidBy');
    console.log('--- Schema Debug ---');
    console.log('Path: paidBy');
    console.log('Is Required:', paidByPath.isRequired);
    console.log('Options:', paidByPath.options);
    console.log('--------------------');
};

run();
