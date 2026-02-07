"use client";

import { motion } from 'framer-motion';
import { User, Globe, Camera, Save, Bell, Lock, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

export default function ProfilePage() {
    const t = useTranslations('Settings');
    const params = useParams();
    // const locale = params.locale as string;
    const [isSaving, setIsSaving] = useState(false);
    const [user, setUser] = useState<{ name: string; email: string } | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user from localStorage", e);
            }
        }
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSaving(false);
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
                        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-1">{t('explorerSince', { year: '2024' })}</p>
                    </div>

                    <div className="glass p-4 rounded-[2rem] border-white/5 bg-white/[0.01] space-y-2">
                        {[
                            { icon: User, label: t('sections.profile'), active: true },
                            { icon: Bell, label: t('sections.notifications'), active: false },
                            { icon: Lock, label: t('sections.security'), active: false },
                            { icon: Info, label: t('sections.about'), active: false },
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
                                    <Input defaultValue={user?.name || ""} className="h-16 rounded-2xl border-white/5 bg-white/[0.03] focus:bg-white/[0.05]" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">{t('personalInfo.displayName')}</label>
                                    <Input defaultValue={user?.name?.toLowerCase().replace(' ', '_') || ""} className="h-16 rounded-2xl border-white/5 bg-white/[0.03] focus:bg-white/[0.05]" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">{t('personalInfo.email')}</label>
                                <Input defaultValue={user?.email || ""} disabled className="h-16 rounded-2xl border-white/5 bg-white/[0.02] opacity-60 flex items-center gap-3 px-6" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">{t('personalInfo.bio')}</label>
                                <textarea
                                    placeholder={t('personalInfo.bioPlaceholder')}
                                    defaultValue="Passionate traveler exploring the hidden gems of Bangladesh. Always ready for a new adventure!"
                                    className="w-full min-h-[120px] bg-white/[0.03] border border-white/[0.08] rounded-[1.5rem] p-6 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-zinc-300 resize-none placeholder:text-zinc-700"
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* Preferences */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass p-10 rounded-[3rem] border-white/5 bg-white/[0.02]"
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                                <Globe className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-black tracking-tighter uppercase text-white">{t('systemPrefs.title')}</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">{t('systemPrefs.language')}</label>
                                <select className="w-full h-16 bg-white/[0.03] border border-white/[0.08] rounded-2xl px-6 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-zinc-300 appearance-none">
                                    <option>English (International)</option>
                                    <option>Bengali (Native)</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">{t('systemPrefs.currency')}</label>
                                <select className="w-full h-16 bg-white/[0.03] border border-white/[0.08] rounded-2xl px-6 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-zinc-300 appearance-none">
                                    <option>BDT (৳)</option>
                                    <option>USD ($)</option>
                                </select>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
