"use client";

import { motion } from 'framer-motion';
import { Plus, Users, MapPin, Search, ArrowRight, UserPlus, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/utils/api';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { isOnline, saveToCache, getFromCache, addToOutbox, getOutbox, removeFromOutbox } from '@/utils/offline';

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
    admin: unknown;
}
export default function GroupsPage() {
    const t = useTranslations('Groups');
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

    const fetchGroups = useCallback(async () => {
        try {
            setLoading(true);

            if (isOnline()) {
                try {
                    const response = await api.get('/groups');
                    setGroups(response.data);
                    saveToCache('groups', response.data);
                    setError(null);
                } catch (apiErr) {
                    const cached = getFromCache('groups');
                    if (cached) {
                        setGroups(cached);
                        setError(t('connectionErrorUsingCache') || 'Connection error. Showing cached data.');
                    } else {
                        throw apiErr;
                    }
                }
            } else {
                const cachedGroups = getFromCache('groups');
                if (cachedGroups) {
                    setGroups(cachedGroups);
                    setError(t('offlineMode') || 'Viewing offline data');
                } else {
                    setError(t('noOfflineData') || 'No offline data available');
                }
            }
        } catch (err) {
            const cachedGroups = getFromCache('groups');
            if (cachedGroups) {
                setGroups(cachedGroups);
                setError(t('connectionErrorUsingCache') || 'Connection error. Showing cached data.');
            } else {
                const errorMessage = err instanceof Error ? (err as any).response?.data?.message || err.message : 'Failed to fetch groups';
                setError(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    }, [t]);


    useEffect(() => {
        // Cache-First: Load from cache immediately on mount
        const cachedGroups = getFromCache('groups');
        if (cachedGroups) {
            setGroups(cachedGroups);
            setLoading(false);
        }

        fetchGroups();

        // Global sync listener
        const refreshData = () => {
            console.log('[Groups] Global sync complete, refreshing...');
            fetchGroups();
        };
        window.addEventListener('app:sync-complete', refreshData);
        return () => window.removeEventListener('app:sync-complete', refreshData);
    }, [fetchGroups]);

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
        const payload = { ...data, guests };
        if (isOnline()) {
            try {
                const response = await api.post('/groups', payload);
                setGroups([response.data, ...groups]);
                saveToCache('groups', [response.data, ...groups]);
                setIsCreateModalOpen(false);
                createForm.reset();
                setGuests([]);
            } catch (err) {
                const errorMessage = err instanceof Error ? (err as any).response?.data?.message || err.message : 'Failed to create group';
                alert(errorMessage);
            }
        } else {
            // Offline: Optimistic UI + Outbox
            const optimisticGroup: Group = {
                _id: 'temp-' + Date.now(),
                name: data.name,
                description: data.description || '',
                members: [],
                guests: guests.map(g => ({ name: g, addedBy: 'me' })),
                inviteCode: 'OFFLINE',
                status: 'Planning',
                role: 'Admin',
                admin: {}
            };

            const newGroups = [optimisticGroup, ...groups];
            setGroups(newGroups);
            saveToCache('groups', newGroups);
            addToOutbox('CREATE_GROUP', payload);

            setIsCreateModalOpen(false);
            createForm.reset();
            setGuests([]);
            alert(t('savedOffline') || 'Saved offline. Will sync when online.');
        }
    };

    const onJoinSubmit = async (data: JoinFormValues) => {
        if (isOnline()) {
            try {
                await api.post('/groups/join', data);
                fetchGroups();
                setIsJoinModalOpen(false);
                joinForm.reset();
            } catch (err) {
                const errorMessage = err instanceof Error ? (err as any).response?.data?.message || err.message : 'Failed to join group';
                alert(errorMessage);
            }
        } else {
            addToOutbox('JOIN_GROUP', data);
            setIsJoinModalOpen(false);
            joinForm.reset();
            alert(t('joinRequestSaved') || 'Join request saved offline.');
        }
    };

    return (
        <div className="space-y-10">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black mb-2 tracking-tighter uppercase">{t('title')}</h1>
                    <p className="text-zinc-500 font-medium">{t('subtitle')}</p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" onClick={() => setIsJoinModalOpen(true)} className="rounded-2xl h-14" size="lg">
                        <UserPlus className="mr-2 w-5 h-5" />
                        {t('joinGroup')}
                    </Button>
                    <Button onClick={() => setIsCreateModalOpen(true)} className="rounded-2xl h-14 shadow-xl shadow-emerald-500/20" size="lg">
                        <Plus className="mr-2 w-5 h-5" />
                        {t('createGroup')}
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
                    placeholder={t('searchPlaceholder') || "Search groups..."}
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
                    <h3 className="text-2xl font-bold text-zinc-400">{t('noGroups')}</h3>
                    <p className="max-w-md mt-4 text-zinc-500">{t('joinGroup')}</p>
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
                                    {t('manageCosts')} <ArrowRight className="w-4 h-4" />
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
                title={t('createGroupModal.title')}
            >
                <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400 ml-1">{t('createGroupModal.groupName')}</label>
                        <Input
                            placeholder={t('createGroupModal.placeholderName')}
                            {...createForm.register('name')}
                        />
                        {createForm.formState.errors.name && (
                            <p className="text-xs text-red-500 ml-1">{createForm.formState.errors.name.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400 ml-1">{t('createGroupModal.description')}</label>
                        <textarea
                            placeholder={t('createGroupModal.placeholderDesc')}
                            className="w-full min-h-[120px] bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-zinc-300 resize-none placeholder:text-zinc-600"
                            {...createForm.register('description')}
                        />
                    </div>

                    {/* Guest Members Section */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400 ml-1">{t('createGroupModal.addMembers')}</label>
                        <div className="flex gap-2">
                            <Input
                                placeholder={t('createGroupModal.placeholderMember')}
                                value={guestInput}
                                onChange={(e) => setGuestInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addGuest();
                                    }
                                }}
                            />
                            <Button type="button" onClick={addGuest} className="rounded-2xl px-6">{t('createGroupModal.addButton')}</Button>
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
                            {t('createGroupModal.cancel')}
                        </Button>
                        <Button type="submit" className="flex-1 h-14 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700">
                            {t('createGroupModal.submit')}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Join Group Modal */}
            <Modal
                isOpen={isJoinModalOpen}
                onClose={() => setIsJoinModalOpen(false)}
                title={t('joinGroupModal.title')}
            >
                <form onSubmit={joinForm.handleSubmit(onJoinSubmit)} className="space-y-6">
                    <div className="space-y-2 text-center mb-8">
                        <p className="text-zinc-500 text-sm">{t('joinGroupModal.subtitle')}</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400 ml-1 text-center block">{t('joinGroupModal.inviteCode')}</label>
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
                        <Button type="submit" className="w-full h-14 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700">
                            {t('joinGroupModal.submit')}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
