import { Request, Response } from 'express';
import { Group } from '../models/Group';
import { User } from '../models/User';
import { Expense, IExpense } from '../models/Expense';
import { emitToGroup } from '../services/socketService';

const SPOT_BADGES: Record<string, { name: string; icon: string; description: string }> = {
    'Sajek': { name: 'Cloud Chaser', icon: '☁️', description: 'Witnessed the dancing clouds of Sajek Valley.' },
    'Cox': { name: 'Beach King', icon: '🏖️', description: "Conquered the world's longest natural sea beach." },
    'Sylhet': { name: 'Tea Taster', icon: '🍵', description: 'Explored the lush tea gardens of the Surma Valley.' },
    'Sundarban': { name: 'Mangrove Medic', icon: '🐅', description: 'Ventured into the home of the Royal Bengal Tiger.' },
    'Saint Martin': { name: 'Coral Crusader', icon: '🏝️', description: 'Visited the only coral island of Bangladesh.' },
    'Rangamati': { name: 'Lake Legend', icon: '⛵', description: 'Navigated the crystalline waters of Kaptai Lake.' },
    'Bandarban': { name: 'Peak Performer', icon: '⛰️', description: 'Scaled the majestic hills of Bandarban.' },
};

const MILESTONE_BADGES: Array<{ count: number; name: string; icon: string; description: string }> = [
    { count: 5, name: 'Rising Traveler', icon: '攀', description: 'Completed 5 journeys across Bangladesh!' },
    { count: 10, name: 'Deshi Veteran', icon: '🎖️', description: 'A true explorer with 10 finished tours.' },
    { count: 15, name: 'Map Master', icon: '🗺️', description: '15 trips logged. You know the map by heart!' },
    { count: 20, name: 'National Legend', icon: '🇧🇩', description: '20 tours completed. You are a Deshi Legend!' },
];

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

        // Determine if there's a spot badge for this destination
        let spotBadge: any = null;
        if (group.destination) {
            const destKey = Object.keys(SPOT_BADGES).find(key =>
                group.destination.toLowerCase().includes(key.toLowerCase())
            );
            if (destKey) {
                spotBadge = SPOT_BADGES[destKey];
            }
        }

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
            const explorerBadgeExists = user.badges.some(b => b.name === 'Desi Explorer');
            if (!explorerBadgeExists) {
                newBadges.push({
                    name: 'Desi Explorer',
                    icon: '🇧🇩',
                    description: 'Completed your first full DesiTrip tour!',
                    earnedAt: new Date(),
                    groupId: id
                });
            }

            // 4. Spot Specific Badge
            if (spotBadge) {
                const hasSpotBadge = user.badges.some(b => b.name === spotBadge.name);
                if (!hasSpotBadge) {
                    newBadges.push({
                        ...spotBadge,
                        earnedAt: new Date(),
                        groupId: id
                    });
                }
            }

            // 5. Milestone Badges (Finished Tour Count)
            const finishedTourCount = await Group.countDocuments({
                members: memberId,
                status: 'finished'
            });

            for (const milestone of MILESTONE_BADGES) {
                if (finishedTourCount >= milestone.count) {
                    const hasMilestoneBadge = user.badges.some(b => b.name === milestone.name);
                    if (!hasMilestoneBadge) {
                        newBadges.push({
                            name: milestone.name,
                            icon: milestone.icon,
                            description: milestone.description,
                            earnedAt: new Date(),
                            groupId: id
                        });
                    }
                }
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
