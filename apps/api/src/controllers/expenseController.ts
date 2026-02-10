import { Request, Response } from 'express';
import { Expense } from '../models/Expense';

export const createExpense = async (req: Request, res: Response) => {
    try {
        const { group: groupId, amount, description, category, splitBetween, payerGuestName, type, isAutoSplit } = req.body;
        const userId = (req as any).user.id;

        // If payerGuestName is provided, use it. Otherwise default to logged-in user.
        const paidBy = payerGuestName ? undefined : userId;

        console.log("Creating Entry:", { groupId, amount, description, category, splitBetween, paidBy, payerGuestName, type, isAutoSplit });

        const expenseData: any = {
            group: groupId,
            payerGuestName,
            type: type || 'Expense',
            amount,
            description,
            category,
            isAutoSplit: isAutoSplit !== undefined ? isAutoSplit : true,
            splitBetween,
        };

        if (paidBy) {
            expenseData.paidBy = paidBy;
        }

        const expense = new Expense(expenseData);

        await expense.save();

        const { emitToGroup } = require('../services/socketService');
        emitToGroup(groupId, 'group_updated', { type: 'EXPENSE_ADDED', expenseId: expense._id });

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

import { Group } from '../models/Group';

export const getExpenseSummary = async (req: Request, res: Response) => {
    try {
        const { groupId } = req.params;
        const expenses = await Expense.find({ group: groupId });
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        const balances: { [key: string]: number } = {};
        const userIds = new Set<string>();

        // Current pool of people for auto-split
        const totalMemberCount = group.members.length + group.guests.length;

        expenses.forEach(exp => {
            // 1. Handle Payer (Owed money)
            if (exp.payerGuestName) {
                const key = `guest:${exp.payerGuestName}`;
                balances[key] = (balances[key] || 0) + exp.amount;
            } else if (exp.paidBy) {
                const paidById = exp.paidBy.toString();
                balances[paidById] = (balances[paidById] || 0) + exp.amount;
                userIds.add(paidById);
            }

            // 2. Handle Splitting (Owe money)
            if (exp.isAutoSplit && exp.type === 'Expense') {
                // Dynamic splitting across ALL CURRENT members and guests
                const splitAmount = exp.amount / totalMemberCount;

                group.members.forEach(memberId => {
                    const mId = memberId.toString();
                    balances[mId] = (balances[mId] || 0) - splitAmount;
                    userIds.add(mId);
                });

                group.guests.forEach(guest => {
                    const key = `guest:${guest.name}`;
                    balances[key] = (balances[key] || 0) - splitAmount;
                });
            } else {
                // Fixed/Manual splitting
                exp.splitBetween.forEach(split => {
                    if (split.user) {
                        const userId = split.user.toString();
                        balances[userId] = (balances[userId] || 0) - split.amount;
                        userIds.add(userId);
                    } else if (split.guestName) {
                        const key = `guest:${split.guestName}`;
                        balances[key] = (balances[key] || 0) - split.amount;
                    }
                });
            }
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
