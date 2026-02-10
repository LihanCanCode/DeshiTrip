import { Request, Response } from 'express';
import { Activity } from '../models/Activity';

export const getGroupActivities = async (req: Request, res: Response) => {
    try {
        const { groupId } = req.params;
        const activities = await Activity.find({ group: groupId })
            .sort({ createdAt: -1 })
            .limit(20);
        res.json(activities);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createActivity = async (data: {
    group: string;
    userId?: string;
    userName: string;
    type: 'EXPENSE_ADDED' | 'MEMBER_JOINED' | 'SETTLEMENT_RECORDED' | 'MEMORY_UPDATED';
    description: string;
    amount?: number;
    category?: string;
}) => {
    try {
        const activity = new Activity(data);
        await activity.save();

        // Broadcast via socket
        const { emitToGroup } = require('../services/socketService');
        emitToGroup(data.group, 'new_activity', activity);

        return activity;
    } catch (error) {
        console.error('Failed to create activity record:', error);
    }
};
