"use client";

import { motion } from 'framer-motion';
import { User, Globe, Camera, Save, Bell, Lock, Info, Award, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import api from '@/utils/api';
import { cn } from '@/utils/cn';

export default function ProfilePage() {
    const t = useTranslations('Settings');
    const params = useParams();
    // const locale = params.locale as string;
    const [isSaving, setIsSaving] = useState(false);
    const [user, setUser] = useState<{
        name: string;
        email: string;
        xp: number;
        displayName: string;
        bio: string;
        badges: Array<{ name: string; icon: string; description: string; earnedAt: string }>
    } | null>(null);

    // Form States
    const [formData, setFormData] = useState({
        name: '',
        displayName: '',
        bio: ''
    });

    const fetchProfile = async () => {
        try {
            const response = await api.get('/auth/me');
            setUser(response.data);
            setFormData({
                name: response.data.name || '',
                displayName: response.data.displayName || '',
                bio: response.data.bio || ''
            });
            localStorage.setItem('user', JSON.stringify({
                id: response.data._id,
                name: response.data.name,
                email: response.data.email
            }));
        } catch (err) {
            console.error('Failed to fetch profile', err);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await api.put('/auth/profile', formData);
            await fetchProfile(); // Refresh data
        } catch (err) {
            console.error('Failed to update profile', err);
        } finally {
            setIsSaving(false);
        }
    };

    const initials = user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'JD';

    return (
        <div className="max-w-4xl mx-auto space-y-10 pb-20">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black mb-2 tracking-tighter uppercase">{t('title')}</h1>
                    <p className="text-zinc-500 font-medium">{t('subtitle')}</p>
                </div>
                <Button
                    onClick={handleSave}
                    isLoading={isSaving}
                    className="rounded-2xl h-14 px-8 shadow-xl shadow-emerald-500/20"
                >
                    <Save className="mr-2 w-5 h-5" />
                    {t('saveChanges')}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Navigation/Summary */}
                <div className="space-y-6">
                    <div className="glass p-8 rounded-[2.5rem] border-white/5 bg-white/[0.02] text-center">
                        <div className="relative inline-block group mb-6">
                            <div className="w-32 h-32 bg-gradient-to-br from-emerald-600 to-teal-800 rounded-[2.5rem] flex items-center justify-center font-black text-4xl shadow-2xl shadow-emerald-500/20 mb-4 transition-transform group-hover:scale-105 duration-500">
                                {initials}
                            </div>
                            <button className="absolute bottom-4 right-0 p-3 bg-zinc-900 border border-white/10 rounded-2xl text-emerald-500 hover:text-white transition-colors shadow-2xl group-hover:scale-110">
                                <Camera className="w-4 h-4" />
                            </button>
                        </div>
                        <h3 className="text-xl font-bold uppercase tracking-tight">{user?.name || 'Guest Explorer'}</h3>
                        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-1 mb-6">{t('explorerSince', { year: '2024' })}</p>

                        <div className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 w-fit mx-auto">
                            <Star className="w-4 h-4 text-emerald-500 fill-emerald-500" />
                            <span className="text-emerald-500 font-black text-sm">{user?.xp || 0} XP</span>
                        </div>
                    </div>

                    <div className="glass p-4 rounded-[2rem] border-white/5 bg-white/[0.01] space-y-2">
                        {[
                            { icon: User, label: t('sections.profile'), active: true },
                        ].map((item, i) => (
                            <button
                                key={i}
                                className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all ${item.active
                                    ? "bg-emerald-500/10 text-emerald-500"
                                    : "text-zinc-500 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="font-bold text-sm tracking-wide">{item.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Quick Stats/Badges Preview */}
                    <div className="glass p-6 rounded-[2.5rem] border-white/5 bg-white/[0.02] space-y-4">
                        <div className="flex items-center gap-3 mb-4 px-2">
                            <Award className="w-5 h-5 text-emerald-500" />
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Total Achievements</h4>
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                            {user?.badges?.length ? user.badges.slice(0, 8).map((badge, i) => (
                                <div key={i} className="aspect-square bg-white/[0.03] rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-white/5" title={badge.name}>
                                    {badge.icon}
                                </div>
                            )) : (
                                [1, 2, 3, 4].map(i => (
                                    <div key={i} className="aspect-square bg-white/[0.01] rounded-2xl border border-dashed border-white/5 flex items-center justify-center text-zinc-800">
                                        ?
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Main Settings Form */}
                <div className="md:col-span-2 space-y-8">
                    {/* Personal Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass p-10 rounded-[3rem] border-white/5 bg-white/[0.02]"
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
                                <User className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-black tracking-tighter uppercase text-white">{t('personalInfo.title')}</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">{t('personalInfo.fullName')}</label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="h-16 rounded-2xl border-white/5 bg-white/[0.03] focus:bg-white/[0.05]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">{t('personalInfo.displayName')}</label>
                                    <Input
                                        value={formData.displayName}
                                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                        placeholder="Display name or handle"
                                        className="h-16 rounded-2xl border-white/5 bg-white/[0.03] focus:bg-white/[0.05]"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">{t('personalInfo.email')}</label>
                                <Input value={user?.email || ""} disabled className="h-16 rounded-2xl border-white/5 bg-white/[0.02] opacity-60 flex items-center gap-3 px-6" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">{t('personalInfo.bio')}</label>
                                <textarea
                                    placeholder={t('personalInfo.bioPlaceholder')}
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    className="w-full min-h-[120px] bg-white/[0.03] border border-white/[0.08] rounded-[1.5rem] p-6 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-zinc-300 resize-none placeholder:text-zinc-700"
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* My Badges Showcase */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass p-10 rounded-[3rem] border-white/5 bg-white/[0.02]"
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
                                <Award className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-black tracking-tighter uppercase text-white">My Badge Collection</h2>
                        </div>

                        {user?.badges?.length ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {user.badges.map((badge, i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all group">
                                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-xl">
                                            {badge.icon}
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold text-sm uppercase tracking-tight">{badge.name}</h4>
                                            <p className="text-zinc-500 text-[10px] uppercase tracking-wider font-medium line-clamp-1">{badge.description}</p>
                                            <div className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mt-1">
                                                Earned {new Date(badge.earnedAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 opacity-40">
                                <Award className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
                                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">No badges earned yet. Start a trip!</p>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
