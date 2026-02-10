import { Request, Response } from 'express';
import Alert from '../models/Alert';
import { Group } from '../models/Group';
import { emitToGroup } from '../services/socketService';

export const triggerSOS = async (req: Request, res: Response) => {
    try {
        const { location, message, voiceData } = req.body;
        const userId = (req as any).user?.id;

        if (!location || !location.coordinates) {
            return res.status(400).json({ message: 'Location is required' });
        }

        // Find all groups the user belongs to
        const userGroups = await Group.find({
            members: userId
        });

        if (userGroups.length === 0) {
            return res.status(400).json({ message: 'You must be in at least one group to trigger SOS' });
        }

        const groupIds = userGroups.map((g: any) => g._id);

        const newAlert = new Alert({
            user: userId,
            groups: groupIds,
            location,
            message,
            voiceData,
            status: 'active'
        });

        await newAlert.save();

        // Populate user info for the socket event
        const populatedAlert = await Alert.findById(newAlert._id).populate('user', 'name email');

        // Emit to each group
        groupIds.forEach((groupId: any) => {
            emitToGroup(groupId.toString(), 'sos_alert', {
                alertId: populatedAlert?._id,
                user: {
                    id: (populatedAlert?.user as any)?._id,
                    name: (populatedAlert?.user as any)?.name,
                    email: (populatedAlert?.user as any)?.email
                },
                location: populatedAlert?.location,
                message: populatedAlert?.message,
                voiceData: populatedAlert?.voiceData,
                timestamp: populatedAlert?.createdAt
            });
        });

        res.status(201).json({
            message: 'SOS Alert triggered successfully',
            alert: populatedAlert
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const resolveAlert = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const alert = await Alert.findById(id);

        if (!alert) {
            return res.status(404).json({ message: 'Alert not found' });
        }

        alert.status = 'resolved';
        await alert.save();

        // Notify groups that it's resolved
        alert.groups.forEach((groupId: any) => {
            emitToGroup(groupId.toString(), 'sos_resolved', {
                alertId: alert._id
            });
        });

        res.status(200).json({ message: 'Alert marked as resolved', alert });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getActiveAlerts = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;

        // Find active alerts in groups where I am a member
        const myGroups = await Group.find({
            members: userId
        });
        const groupIds = myGroups.map((g: any) => g._id);

        const alerts = await Alert.find({
            groups: { $in: groupIds },
            status: 'active'
        }).populate('user', 'name email');

        res.status(200).json(alerts);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
