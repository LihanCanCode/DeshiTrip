import { Request, Response } from 'express';
import { Group } from '../models/Group';
import { v4 as uuidv4 } from 'uuid';

export const createGroup = async (req: Request, res: Response) => {
    try {
        const { name, description, guests } = req.body;
        const adminId = (req as any).user.id;

        const group = new Group({
            name,
            description,
            admin: adminId,
            members: [adminId],
            guests: guests ? guests.map((g: string) => ({ name: g, addedBy: adminId })) : [],
            inviteCode: uuidv4().substring(0, 8).toUpperCase(),
        });

        await group.save();
        res.status(201).json(group);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getGroups = async (req: Request, res: Response) => {
    try {
        const adminId = (req as any).user.id;
        console.log('[getGroups] Fetching groups for user ID:', adminId);

        // Use Type casting to ensure it's a valid ObjectId if possible
        // Populate members with name to allow frontend to display names in dropdowns
        const groups = await Group.find({ members: adminId }).populate('members', 'name email avatar');

        console.log('[getGroups] Found:', groups.length);
        res.json(groups);
    } catch (error: any) {
        console.error('[getGroups] Fatal error:', error.message);
        res.status(500).json({ message: error.message });
    }
};

export const joinGroup = async (req: Request, res: Response) => {
    try {
        const { inviteCode } = req.body;
        const userId = (req as any).user.id;

        const group = await Group.findOne({ inviteCode });
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        if (group.members.includes(userId)) {
            return res.status(400).json({ message: 'Already a member' });
        }

        group.members.push(userId);
        await group.save();

        const { emitToGroup } = require('../services/socketService');
        emitToGroup(group._id.toString(), 'group_updated', { type: 'MEMBER_JOINED', userId });

        res.json(group);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateGroupMemory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { coverImage, memoryNote, milestones, foodieStat } = req.body;
        const userId = (req as any).user.id;

        const group = await Group.findById(id);
        if (!group) return res.status(404).json({ message: 'Group not found' });

        // Only members can update memory
        if (!group.members.includes(userId)) {
            return res.status(403).json({ message: 'Only members can update memory' });
        }

        if (coverImage) group.coverImage = coverImage;
        if (memoryNote !== undefined) group.memoryNote = memoryNote;
        if (milestones !== undefined) group.milestones = milestones;
        if (foodieStat !== undefined) group.foodieStat = foodieStat;
        await group.save();

        res.json(group);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
