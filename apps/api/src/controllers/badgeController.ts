import { Request, Response } from 'express';
import { Group } from '../models/Group';
import { User } from '../models/User';
import { Expense, IExpense } from '../models/Expense';
import { emitToGroup } from '../services/socketService';

export const finishTour = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const userId = (req as any).user?.id;

        const group = await Group.findById(id);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Only admin can finish the tour
        if (group.admin.toString() !== userId) {
            return res.status(403).json({ message: 'Only the group admin can finalize the tour' });
        }

        if (group.status === 'finished') {
            return res.status(400).json({ message: 'Tour is already finalized' });
        }

        // Mark group as finished
        group.status = 'finished';
        group.finishedAt = new Date();
        await group.save();

        // Fetch all expenses to calculate stats (Excluding Settlements)
        const expenses = await Expense.find({
            group: id,
            type: { $ne: 'Settlement' }
        });

        const totalSpent = expenses.reduce((sum: number, exp: IExpense) => sum + exp.amount, 0);
        const expenseCount = expenses.length;

        // Award badges to all members
        const members = group.members;
        const badgeRecords = [];

        for (const memberId of members) {
            const user = await User.findById(memberId);
            if (!user) continue;

            const newBadges = [];

            // 1. "Squad Leader" for the admin
            if (memberId.toString() === group.admin.toString()) {
                const badgeExists = user.badges.some(b => b.name === 'Squad Leader');
                if (!badgeExists) {
                    newBadges.push({
                        name: 'Squad Leader',
                        icon: '👑',
                        description: 'Successfully led a trip to the finish line!',
                        earnedAt: new Date(),
                        groupId: id
                    });
                }
            }

            // 2. "Budget Master" if they logged many expenses
            const userExpenses = expenses.filter((e: IExpense) => e.paidBy?.toString() === memberId.toString());
            if (userExpenses.length >= 5) {
                const badgeExists = user.badges.some(b => b.name === 'Budget Master');
                if (!badgeExists) {
                    newBadges.push({
                        name: 'Budget Master',
                        icon: '💰',
                        description: 'Diligent expense tracker of the squad.',
                        earnedAt: new Date(),
                        groupId: id
                    });
                }
            }

            // 3. "Explorer" badge for completing a tour
            const badgeExists = user.badges.some(b => b.name === 'Desi Explorer');
            if (!badgeExists) {
                newBadges.push({
                    name: 'Desi Explorer',
                    icon: '🇧🇩',
                    description: 'Completed your first full DesiTrip tour!',
                    earnedAt: new Date(),
                    groupId: id // Save which group this was earned in
                });
            }

            if (newBadges.length > 0) {
                user.badges.push(...newBadges);
                user.xp += (newBadges.length * 100) + 50; // 100 XP per badge + 50 for completion
                await user.save();

                badgeRecords.push({
                    userId: memberId,
                    badges: newBadges
                });
            } else {
                user.xp += 50; // Completion XP even if no new badges
                await user.save();
            }
        }

        const summary = {
            totalSpent,
            expenseCount,
            memberCount: members.length,
            memoryImage: group.coverImage,
            tripName: group.name,
            finishedAt: group.finishedAt || new Date()
        };

        // Notify group members
        emitToGroup(id as string, 'tour_finished', {
            groupId: id,
            summary,
            newBadges: badgeRecords
        });

        res.status(200).json({
            message: 'Tour finalized successfully!',
            summary,
            newBadges: badgeRecords
        });
    } catch (error: any) {
        console.error('Finish Tour Error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const getTourSummary = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const groupId = id as string;
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        const expenses = await Expense.find({
            group: id,
            type: { $ne: 'Settlement' }
        });
        const totalSpent = expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);

        const summary = {
            totalSpent,
            expenseCount: expenses.length,
            memberCount: group.members.length,
            memoryImage: group.coverImage,
            tripName: group.name,
            finishedAt: group.finishedAt || group.updatedAt
        };

        // Also fetch user's badges for this group if user is logged in
        const userId = (req as any).user?.id;
        let badges: any[] = [];
        if (userId) {
            const user = await User.findById(userId);
            if (user) {
                badges = user.badges.filter(b => b.groupId === groupId);
            }
        }

        res.json({ ...summary, badges });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
