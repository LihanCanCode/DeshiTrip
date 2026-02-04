"use client";

import { motion } from 'framer-motion';
import { Plus, Users, MapPin, Search, ArrowRight, UserPlus, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/utils/api';
import { useParams } from 'next/navigation';
import Link from 'next/link';

const groupSchema = z.object({
    name: z.string().min(3, 'Group name must be at least 3 characters'),
    description: z.string().optional(),
});

const joinSchema = z.object({
    inviteCode: z.string().min(6, 'Invite code must be at least 6 characters'),
});

type GroupFormValues = z.infer<typeof groupSchema>;
type JoinFormValues = z.infer<typeof joinSchema>;

interface Group {
    _id: string;
    name: string;
    description: string;
    members: string[];
    guests: { name: string; addedBy: string }[];
    inviteCode: string;
    status: 'Upcoming' | 'Planning' | 'Completed';
    role: 'Admin' | 'Member';
    admin: any;
}

export default function GroupsPage() {
    const params = useParams();
    const locale = params.locale as string;
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Guest Management State
    const [guestInput, setGuestInput] = useState('');
    const [guests, setGuests] = useState<string[]>([]);

    const createForm = useForm<GroupFormValues>({
        resolver: zodResolver(groupSchema),
    });

    const joinForm = useForm<JoinFormValues>({
        resolver: zodResolver(joinSchema),
    });

    const fetchGroups = async () => {
        try {
            setLoading(true);
            const response = await api.get('/groups');
            setGroups(response.data);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch groups');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    const addGuest = () => {
        if (guestInput.trim() && !guests.includes(guestInput.trim())) {
            setGuests([...guests, guestInput.trim()]);
            setGuestInput('');
        }
    };

    const removeGuest = (index: number) => {
        setGuests(guests.filter((_, i) => i !== index));
    };

    const onCreateSubmit = async (data: GroupFormValues) => {
        try {
            const payload = { ...data, guests };
            const response = await api.post('/groups', payload);
            setGroups([response.data, ...groups]);
            setIsCreateModalOpen(false);
            createForm.reset();
            setGuests([]); // Reset guests
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to create group');
        }
    };

    const onJoinSubmit = async (data: JoinFormValues) => {
        try {
            await api.post('/groups/join', data);
            fetchGroups(); // Refresh list to get the new group
            setIsJoinModalOpen(false);
            joinForm.reset();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to join group');
        }
    };

    return (
        <div className="space-y-10">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black mb-2">My Groups</h1>
                    <p className="text-zinc-500">Manage your travel squads and join new adventures.</p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" onClick={() => setIsJoinModalOpen(true)} className="rounded-2xl h-14" size="lg">
                        <UserPlus className="mr-2 w-5 h-5" />
                        Join Group
                    </Button>
                    <Button onClick={() => setIsCreateModalOpen(true)} className="rounded-2xl h-14" size="lg">
                        <Plus className="mr-2 w-5 h-5" />
                        Create Group
                    </Button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-6 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5" />
                    <p className="font-bold">{error}</p>
                </div>
            )}

            {/* Search and Filters */}
            <div className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
                <input
                    placeholder="Search groups..."
                    className="w-full h-16 bg-white/[0.02] border border-white/5 rounded-[1.5rem] pl-16 pr-6 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                />
            </div>

            {/* Groups Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2].map((i) => (
                        <div key={i} className="glass p-8 rounded-[2.5rem] h-64 animate-pulse bg-white/[0.02] border-white/5" />
                    ))}
                </div>
            ) : groups.length === 0 ? (
                <div className="glass p-20 rounded-[3rem] border-white/5 bg-white/[0.02] flex flex-col items-center justify-center text-center opacity-60">
                    <Users className="w-16 h-16 mb-6 text-zinc-600" />
                    <h3 className="text-2xl font-bold text-zinc-400">No groups found</h3>
                    <p className="max-w-md mt-4 text-zinc-500">You haven't joined any travel groups yet. Create one or join with an invite code to start your adventure!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {groups.map((group, i) => (
                        <motion.div
                            key={group._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="glass p-8 rounded-[2.5rem] border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all cursor-pointer group"
                        >
                            <div className="flex justify-between items-start mb-8">
                                <div className="w-20 h-20 bg-gradient-to-br from-emerald-600 to-teal-800 rounded-3xl flex items-center justify-center font-black text-3xl shadow-lg shadow-emerald-500/10">
                                    {group.name[0]}
                                </div>
                                <div className="space-y-2 text-right">
                                    <div className="px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase border bg-emerald-500/10 border-emerald-500/20 text-emerald-500">
                                        Active
                                    </div>
                                    <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                                        ID: {group.inviteCode}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1 mb-8">
                                <h3 className="text-2xl font-bold group-hover:text-emerald-400 transition-colors">{group.name}</h3>
                                <p className="text-zinc-500 text-sm line-clamp-2">{group.description}</p>
                            </div>

                            <div className="flex items-center justify-between pt-8 border-t border-white/5">
                                <div className="flex items-center gap-6 text-sm text-zinc-400">
                                    <span className="flex items-center gap-2 font-medium text-emerald-500/80">
                                        <Users className="w-4 h-4" /> {(group.members?.length || 0) + (group.guests?.length || 0)} members
                                    </span>
                                </div>
                                <Link
                                    href={`/${locale}/dashboard/expenses?groupId=${group._id}`}
                                    className="flex items-center gap-2 text-white font-bold text-sm bg-white/5 hover:bg-emerald-500 hover:text-white transition-all px-4 py-2 rounded-xl"
                                >
                                    Manage Costs <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Create Group Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Create New Group"
            >
                <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400 ml-1">Group Name</label>
                        <Input
                            placeholder="e.g. Dream Sylhet Tour"
                            {...createForm.register('name')}
                        />
                        {createForm.formState.errors.name && (
                            <p className="text-xs text-red-500 ml-1">{createForm.formState.errors.name.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400 ml-1">Description</label>
                        <textarea
                            placeholder="Short description of your trip..."
                            className="w-full min-h-[120px] bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-zinc-300 resize-none placeholder:text-zinc-600"
                            {...createForm.register('description')}
                        />
                    </div>

                    {/* Guest Members Section */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400 ml-1">Add Members (Optional)</label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Enter name (e.g. Rahim)"
                                value={guestInput}
                                onChange={(e) => setGuestInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addGuest();
                                    }
                                }}
                            />
                            <Button type="button" onClick={addGuest} className="rounded-2xl px-6">Add</Button>
                        </div>

                        {guests.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                                {guests.map((guest, idx) => (
                                    <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-bold border border-emerald-500/20">
                                        {guest}
                                        <button
                                            type="button"
                                            onClick={() => removeGuest(idx)}
                                            className="hover:text-red-400 transition-colors"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="pt-4 flex gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1 h-14 rounded-2xl"
                            onClick={() => setIsCreateModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1 h-14 rounded-2xl">
                            Create Group
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Join Group Modal */}
            <Modal
                isOpen={isJoinModalOpen}
                onClose={() => setIsJoinModalOpen(false)}
                title="Join a Group"
            >
                <form onSubmit={joinForm.handleSubmit(onJoinSubmit)} className="space-y-6">
                    <div className="space-y-2 text-center mb-8">
                        <p className="text-zinc-500 text-sm">Enter the 8-character invite code shared by your group admin.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400 ml-1 text-center block">Invite Code</label>
                        <Input
                            placeholder="e.g. 5F3E2B8A"
                            className="text-center tracking-[0.5em] font-black uppercase text-xl placeholder:tracking-normal placeholder:font-normal placeholder:text-base"
                            {...joinForm.register('inviteCode')}
                        />
                        {joinForm.formState.errors.inviteCode && (
                            <p className="text-xs text-red-500 text-center">{joinForm.formState.errors.inviteCode.message}</p>
                        )}
                    </div>

                    <div className="pt-4">
                        <Button type="submit" className="w-full h-14 rounded-2xl">
                            Join Journey
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
