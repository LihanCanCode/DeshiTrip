"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, UserPlus, CreditCard, Camera, Info, TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';

export interface Activity {
    _id: string;
    userName: string;
    type: 'EXPENSE_ADDED' | 'MEMBER_JOINED' | 'SETTLEMENT_RECORDED' | 'MEMORY_UPDATED';
    description: string;
    amount?: number;
    category?: string;
    createdAt: string;
}

interface ActivityFeedProps {
    activities: Activity[];
}

export const ActivityFeed = ({ activities }: ActivityFeedProps) => {
    const t = useTranslations('Expenses.activity');

    const getIcon = (type: string) => {
        switch (type) {
            case 'EXPENSE_ADDED':
                return <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-emerald-500" />;
            case 'MEMBER_JOINED':
                return <UserPlus className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />;
            case 'SETTLEMENT_RECORDED':
                return <CreditCard className="w-4 h-4 md:w-5 md:h-5 text-purple-500" />;
            case 'MEMORY_UPDATED':
                return <Camera className="w-4 h-4 md:w-5 md:h-5 text-amber-500" />;
            default:
                return <Info className="w-4 h-4 md:w-5 md:h-5 text-zinc-500" />;
        }
    };

    const getRelativeTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="glass p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border-white/5 bg-white/[0.02] flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-emerald-500" />
                    </div>
                    <h3 className="text-base md:text-lg font-black tracking-tight text-white uppercase">
                        Live Feed
                    </h3>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Live Updates Active"></div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                <AnimatePresence initial={false}>
                    {activities.length === 0 ? (
                        <div className="text-center py-12 text-zinc-500 text-xs md:text-sm italic">
                            No activities yet. Start your trip!
                        </div>
                    ) : (
                        activities.map((activity, i) => (
                            <motion.div
                                key={activity._id}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: i * 0.05 }}
                                className="flex gap-3 md:gap-4 items-start group p-3 md:p-4 rounded-xl md:rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all"
                            >
                                <div className="mt-0.5 p-2 md:p-2.5 rounded-lg md:rounded-xl bg-zinc-900 border border-white/5 transition-transform group-hover:scale-110 shrink-0">
                                    {getIcon(activity.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs md:text-sm text-zinc-300 leading-snug">
                                        <span className="font-bold text-white">
                                            {activity.userName}
                                        </span>{' '}
                                        {activity.type === 'MEMBER_JOINED' ? (
                                            <span className="text-zinc-400">joined the group</span>
                                        ) : activity.type === 'EXPENSE_ADDED' ? (
                                            <>
                                                <span className="text-zinc-400">added</span>{' '}
                                                <span className="font-bold text-emerald-400">৳{activity.amount?.toLocaleString()}</span>{' '}
                                                <span className="text-zinc-400">{activity.description}</span>
                                            </>
                                        ) : activity.type === 'SETTLEMENT_RECORDED' ? (
                                            <>
                                                <span className="text-zinc-400">settled</span>{' '}
                                                <span className="font-bold text-purple-400">৳{activity.amount?.toLocaleString()}</span>
                                            </>
                                        ) : (
                                            <span className="text-zinc-400">{activity.description}</span>
                                        )}
                                    </p>
                                    <span className="text-[10px] md:text-[11px] text-zinc-500 uppercase tracking-wider font-bold mt-1 block">
                                        {getRelativeTime(activity.createdAt)}
                                    </span>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
