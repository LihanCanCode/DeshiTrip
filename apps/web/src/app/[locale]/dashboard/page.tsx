"use client";

import { motion } from 'framer-motion';
import { Plus, Users, Calendar, MapPin, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useParams } from 'next/navigation';
import { cn } from '@/utils/cn';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslations } from 'next-intl';
import api from '@/utils/api';

const groupSchema = z.object({
    name: z.string().min(3, 'Group name must be at least 3 characters'),
    destination: z.string().min(2, 'Destination must be at least 2 characters'),
    description: z.string().optional(),
});

type GroupFormValues = z.infer<typeof groupSchema>;

interface Group {
    _id: string;
    name: string;
    members: any[];
    guests: any[];
    inviteCode: string;
    destination: string;
}

export default function DashboardPage() {
    const t = useTranslations('Dashboard');
    const params = useParams();
    const locale = params.locale as string;
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        activeGroups: 0,
        spotsExplored: 3, // Mocked for now
        plannedTours: 1   // Mocked for now
    });

    const [guestInput, setGuestInput] = useState('');
    const [guests, setGuests] = useState<string[]>([]);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<GroupFormValues>({
        resolver: zodResolver(groupSchema),
    });

    const activeGroupsCount = groups?.length || 0;

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/groups');
            setGroups(response.data);
            setStats(prev => ({
                ...prev,
                activeGroups: response.data.length
            }));
        } catch (err) {
            console.error('Failed to fetch dashboard data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
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

    const onSubmit = async (data: GroupFormValues) => {
        try {
            const payload = { ...data, guests };
            await api.post('/groups', payload);
            setIsCreateModalOpen(false);
            reset();
            setGuests([]); // Reset guests
            fetchData(); // Refresh dashboard
        } catch (err) {
            const errorMessage = err instanceof Error ? (err as any).response?.data?.message || err.message : 'Failed to create group';
            alert(errorMessage);
        }
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-zinc-500">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
                <p className="font-bold animate-pulse uppercase tracking-[0.2em] text-[10px]">Syncing Adventure Hub...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tighter uppercase">{t('title')}</h1>
                    <p className="text-zinc-500 font-medium">{t('subtitle')}</p>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)} className="w-full md:w-auto rounded-2xl h-14 px-8 shadow-xl shadow-emerald-500/20" size="lg">
                    <Plus className="mr-2 w-5 h-5" />
                    {t('newJourney')}
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { icon: Users, label: t('stats.activeSquads'), value: activeGroupsCount.toString(), color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { icon: MapPin, label: t('stats.hotspots'), value: stats.spotsExplored.toString(), color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { icon: Calendar, label: t('stats.itineraries'), value: stats.plannedTours.toString(), color: 'text-orange-500', bg: 'bg-orange-500/10', className: "sm:col-span-2 lg:col-span-1" },
                ].map((stat, i) => (
                    <div key={i} className={cn(
                        "glass p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border-white/5 bg-white/[0.02] flex items-center gap-6 group hover:bg-white/[0.04] transition-all",
                        stat.className
                    )}>
                        <div className={`p-4 md:p-5 rounded-2xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110 duration-500`}>
                            <stat.icon className="w-6 h-6 md:w-8 md:h-8" />
                        </div>
                        <div>
                            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
                            <h3 className="text-3xl md:text-4xl font-black mt-1 tracking-tighter">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-zinc-500 pb-10">
                {/* Active Groups List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center px-2">
                        <h2 className="text-xl md:text-2xl font-black tracking-tighter text-white uppercase">{t('sections.activeSquads')}</h2>
                        <Link href={`/${locale}/dashboard/groups`} className="text-emerald-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">{t('sections.viewAll')}</Link>
                    </div>

                    {groups.length === 0 ? (
                        <div className="glass p-12 md:p-20 rounded-[2.5rem] md:rounded-[3rem] border-white/5 bg-white/[0.01] flex flex-col items-center justify-center text-center opacity-40">
                            <Users className="w-12 h-12 md:w-16 md:h-16 mb-4 text-zinc-600" />
                            <h3 className="text-base md:text-lg font-bold uppercase tracking-widest text-zinc-400">{t('noSquads')}</h3>
                            <Link href={`/${locale}/dashboard/groups`} className="mt-4 text-emerald-500 text-xs font-bold hover:underline">{t('startAdventure')} →</Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {groups.slice(0, 3).map((group, i) => (
                                <Link href={`/${locale}/dashboard/groups`} key={group._id} className="block">
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="glass p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                                    >
                                        <div className="flex items-center gap-4 md:gap-6 w-full sm:w-auto">
                                            <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-emerald-600 to-teal-800 rounded-[1.2rem] md:rounded-[1.5rem] flex items-center justify-center font-black text-xl md:text-2xl shadow-lg shadow-emerald-500/10 shrink-0">
                                                {group.name[0]}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="text-lg md:text-xl font-bold group-hover:text-emerald-400 transition-colors uppercase tracking-tight truncate">{group.name}</h3>
                                                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">
                                                    <MapPin className="w-3 h-3 text-emerald-500" />
                                                    {group.destination || 'Unset'}
                                                </div>
                                                <div className="flex items-center gap-3 md:gap-4 text-[10px] font-black uppercase tracking-widest text-zinc-600">
                                                    <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {(group.members?.length || 0) + (group.guests?.length || 0)} members</span>
                                                    <span className="sm:inline-flex hidden items-center gap-1.5 px-2 py-0.5 bg-white/5 rounded-full">Code: {group.inviteCode}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="self-end sm:self-auto px-4 py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                            <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">Live</span>
                                        </div>
                                    </motion.div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recommendations / Activity */}
                <div className="space-y-6">
                    <div className="flex justify-between items-center px-2">
                        <h2 className="text-xl md:text-2xl font-black tracking-tighter text-white uppercase">{t('sections.curatedSpots')}</h2>
                    </div>
                    <div className="space-y-4">
                        {[
                            { spot: 'Ratargul', district: 'Sylhet', image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400&auto=format&fit=crop' },
                            { spot: 'Sundarbans', district: 'Khulna', image: 'https://images.unsplash.com/photo-1623945359620-8049281559ed?w=400&auto=format&fit=crop' },
                        ].map((rec, i) => (
                            <Link href={`/${locale}/recommend`} key={i} className="block group relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] h-48 md:h-56 cursor-pointer border border-white/5 shadow-2xl">
                                <img
                                    src={rec.image}
                                    alt={rec.spot}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[30%] group-hover:grayscale-0"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
                                <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8">
                                    <h4 className="text-lg md:text-xl font-black tracking-tight uppercase">{rec.spot}</h4>
                                    <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 mt-1 opacity-80"><MapPin className="w-3 h-3" /> {rec.district}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                    <Link href={`/${locale}/recommend`} className="block">
                        <Button variant="outline" className="w-full h-14 md:h-16 rounded-2xl md:rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] border-white/5 bg-white/[0.01]">
                            {t('sections.exploreAll')}
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Create Group Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Start New Journey"
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Group Name</label>
                        <Input
                            placeholder="e.g. Sylhet Expedition"
                            className={errors.name ? 'border-red-500/50 bg-red-500/5 h-16 rounded-2xl' : 'h-16 rounded-2xl'}
                            {...register('name')}
                        />
                        {errors.name && (
                            <p className="flex items-center gap-1.5 text-xs text-red-500 ml-1">
                                <AlertCircle className="w-3 h-3" /> {errors.name.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Destination</label>
                        <Input
                            placeholder="e.g. Sajek Valley, Rangamati"
                            className={errors.destination ? 'border-red-500/50 bg-red-500/5 h-16 rounded-2xl' : 'h-16 rounded-2xl'}
                            {...register('destination')}
                        />
                        {errors.destination && (
                            <p className="flex items-center gap-1.5 text-xs text-red-500 ml-1">
                                <AlertCircle className="w-3 h-3" /> {errors.destination.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Description</label>
                        <textarea
                            placeholder="Tell us about this adventure..."
                            className="w-full min-h-[120px] bg-white/[0.03] border border-white/[0.08] rounded-[1.5rem] p-6 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-zinc-300 resize-none placeholder:text-zinc-700"
                            {...register('description')}
                        />
                    </div>

                    {/* Guest Members Section */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400 ml-1">Add Members (Optional)</label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Enter name (e.g. Nazmul)"
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
                                            <div className="w-3 h-3 flex items-center justify-center">x</div>
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
                            className="flex-1 h-16 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest"
                            onClick={() => setIsCreateModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1 h-16 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest bg-emerald-600 shadow-xl shadow-emerald-500/20">
                            Create Squad
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
