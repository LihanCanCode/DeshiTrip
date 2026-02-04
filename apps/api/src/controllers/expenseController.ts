import { Request, Response } from 'express';
import { Expense } from '../models/Expense';

export const createExpense = async (req: Request, res: Response) => {
    try {
        const { group, amount, description, category, splitBetween, payerGuestName, type } = req.body;
        const userId = (req as any).user.id;

        // If payerGuestName is provided, use it. Otherwise default to logged-in user.
        const paidBy = payerGuestName ? undefined : userId;

        console.log("Creating Entry:", { group, amount, description, category, splitBetween, paidBy, payerGuestName, type });

        const expenseData: any = {
            group,
            payerGuestName,
            type: type || 'Expense',
            amount,
            description,
            category,
            splitBetween,
        };

        if (paidBy) {
            expenseData.paidBy = paidBy;
        }

        const expense = new Expense(expenseData);

        await expense.save();
        res.status(201).json(expense);
    } catch (error: any) {
        console.error("Expense Creation Error:", error);
        res.status(500).json({ message: error.message });
    }
};

export const getGroupExpenses = async (req: Request, res: Response) => {
    try {
        const { groupId } = req.params;
        const expenses = await Expense.find({ group: groupId })
            .populate('paidBy', 'name')
            .sort({ date: -1 }); // Sort by newest first
        res.json(expenses);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

import { User } from '../models/User';

export const getExpenseSummary = async (req: Request, res: Response) => {
    try {
        const { groupId } = req.params;
        const expenses = await Expense.find({ group: groupId });

        const balances: { [key: string]: number } = {};
        const userIds = new Set<string>();

        expenses.forEach(exp => {
            // PaidBy gets positive balance (They paid, so they are owed money/credit)
            if (exp.payerGuestName) {
                const key = `guest:${exp.payerGuestName}`;
                balances[key] = (balances[key] || 0) + exp.amount;
            } else if (exp.paidBy) {
                const paidById = exp.paidBy.toString();
                balances[paidById] = (balances[paidById] || 0) + exp.amount;
                userIds.add(paidById);
            }

            // Those who split get negative balance (They consumed/received, so they owe money)
            exp.splitBetween.forEach(split => {
                if (split.user) {
                    const userId = split.user.toString();
                    balances[userId] = (balances[userId] || 0) - split.amount;
                    userIds.add(userId);
                } else {
                    const guestName = split.guestName || 'Unknown';
                    // Prefix guest names to avoid ID collision (though unlikely)
                    const key = `guest:${guestName}`;
                    balances[key] = (balances[key] || 0) - split.amount;
                }
            });
        });

        // Resolve User IDs to Names
        const users = await User.find({ _id: { $in: Array.from(userIds) } }).select('name');
        const userMap = users.reduce((acc, user) => {
            acc[user._id.toString()] = user.name;
            return acc;
        }, {} as { [key: string]: string });

        // Format Result
        const summary = Object.entries(balances).map(([key, amount]) => {
            let name = key;
            if (key.startsWith('guest:')) {
                name = key.replace('guest:', '') + ' (Guest)';
            } else {
                name = userMap[key] || 'Unknown User';
            }
            return { name, amount };
        }).filter(item => Math.abs(item.amount) > 0.01); // Filter out zero balances

        res.json(summary);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
