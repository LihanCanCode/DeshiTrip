"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    Trophy,
    Share2,
    Download,
    X,
    TrendingUp,
    Users,
    Calendar,
    CheckCircle2
} from "lucide-react";
import { Button } from "./ui/Button";
import { useState, useRef } from "react";
import { toJpeg } from "html-to-image";

interface Badge {
    name: string;
    icon: string;
    description: string;
}

interface TourSummary {
    totalSpent: number;
    expenseCount: number;
    memberCount: number;
    memoryImage?: string;
    tripName: string;
    finishedAt: string;
}

interface TourWrappedModalProps {
    isOpen: boolean;
    onClose: () => void;
    summary: TourSummary;
    myNewBadges: Badge[];
}

export const TourWrappedModal = ({ isOpen, onClose, summary, myNewBadges }: TourWrappedModalProps) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isSharing, setIsSharing] = useState(false);

    const handleDownload = async () => {
        if (cardRef.current === null) return;

        try {
            const dataUrl = await toJpeg(cardRef.current, { quality: 0.95 });
            const link = document.createElement('a');
            link.download = `DesiTrip-${summary.tripName}-Wrapped.jpg`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error("Failed to generate image:", err);
        }
    };

    const handleShare = async () => {
        if (cardRef.current === null) return;
        setIsSharing(true);

        try {
            const dataUrl = await toJpeg(cardRef.current, { quality: 0.95 });
            const blob = await (await fetch(dataUrl)).blob();
            const file = new File([blob], 'tour-wrapped.jpg', { type: 'image/jpeg' });

            if (navigator.share) {
                await navigator.share({
                    title: `Our DesiTrip to ${summary.tripName}!`,
                    text: `We just finished our amazing tour to ${summary.tripName}. Check out our trip wrapped!`,
                    files: [file]
                });
            } else {
                handleDownload();
            }
        } catch (err) {
            console.error("Sharing failed:", err);
        } finally {
            setIsSharing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="relative w-full max-w-md bg-[#0B0C0E] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] max-h-[90vh] flex flex-col"
                >
                    {/* Shareable Content Area */}
                    <div
                        ref={cardRef}
                        className="relative bg-[#0B0C0E] overflow-y-auto flex-1 min-h-0 flex flex-col hide-scrollbar"
                    >
                        {/* Dynamic Background */}
                        <div className="absolute inset-0 z-0">
                            {summary?.memoryImage ? (
                                <>
                                    <img
                                        src={summary.memoryImage}
                                        crossOrigin="anonymous"
                                        alt=""
                                        className="w-full h-full object-cover opacity-80 blur-[2px] scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-b from-[#0B0C0E]/20 via-[#0B0C0E]/70 to-[#0B0C0E]" />
                                </>
                            ) : (
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.1),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.1),transparent_50%)]" />
                            )}
                        </div>

                        {/* Content Overlay */}
                        <div className="relative z-10 p-8 flex-1 flex flex-col">
                            {/* Header Section */}
                            <div className="text-center space-y-3 mb-8">
                                <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
                                    <Trophy className="w-3 h-3 text-yellow-400" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/70">Tour Wrapped</span>
                                </div>
                                <h2 className="text-5xl font-black text-white uppercase tracking-tighter italic leading-none break-words">
                                    {summary.tripName}
                                </h2>
                                <div className="h-px w-12 bg-emerald-500/50 mx-auto my-2" />
                                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">
                                    Final Summary • {new Date(summary.finishedAt).toLocaleDateString()}
                                </p>
                            </div>

                            {/* Summary Stats Grid */}
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <div className="bg-white/[0.03] backdrop-blur-xl p-6 rounded-[2rem] border border-white/[0.08] text-center group hover:bg-white/[0.05] transition-all">
                                    <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-500/20">
                                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <div className="text-3xl font-black text-white italic tracking-tighter leading-none mb-1">
                                        ৳{summary.totalSpent.toLocaleString()}
                                    </div>
                                    <div className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Total Spent</div>
                                </div>
                                <div className="bg-white/[0.03] backdrop-blur-xl p-6 rounded-[2rem] border border-white/[0.08] text-center group hover:bg-white/[0.05] transition-all">
                                    <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-3 border border-blue-500/20">
                                        <Users className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div className="text-3xl font-black text-white italic tracking-tighter leading-none mb-1">
                                        {summary.memberCount}
                                    </div>
                                    <div className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Squad</div>
                                </div>
                                <div className="bg-white/[0.03] backdrop-blur-xl p-5 rounded-[2rem] border border-white/[0.08] text-center col-span-2 relative overflow-hidden group hover:bg-white/[0.05] transition-all">
                                    <div className="relative z-10">
                                        <div className="text-xl font-black text-white italic tracking-tighter">
                                            "{summary.expenseCount} Memories Logged"
                                        </div>
                                        <div className="text-[9px] text-zinc-500 font-black uppercase tracking-widest mt-1">Total Transactions Across Trip</div>
                                    </div>
                                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Calendar className="w-12 h-12 text-white" />
                                    </div>
                                </div>
                            </div>

                            {/* Badges Section */}
                            {myNewBadges.length > 0 && (
                                <div className="space-y-6 flex-1 flex flex-col justify-center border-t border-white/5 pt-6 mb-8">
                                    <div className="text-center">
                                        <h3 className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-4">Badges Earned</h3>
                                        <div className="flex flex-wrap justify-center gap-6">
                                            {myNewBadges.map((badge, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ y: 20, opacity: 0 }}
                                                    animate={{ y: 0, opacity: 1 }}
                                                    transition={{ delay: 0.3 + (i * 0.1) }}
                                                    className="group relative"
                                                >
                                                    <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-[1.5rem] flex items-center justify-center text-4xl shadow-xl shadow-orange-600/20 relative z-10 border border-white/20">
                                                        {badge.icon}
                                                    </div>
                                                    <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1.5 shadow-lg z-20 border border-zinc-200">
                                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                                    </div>
                                                    {/* Glow Effect */}
                                                    <div className="absolute inset-0 bg-yellow-400/20 blur-2xl rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="text-center px-4">
                                        <p className="text-sm font-black text-white italic tracking-tight">{myNewBadges[0].name}</p>
                                        <p className="text-[10px] font-bold text-zinc-500 max-w-xs mx-auto mt-1 italic opacity-80">
                                            {myNewBadges[0].description}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Branding Footer */}
                            <div className="flex items-center justify-center gap-3 pt-8 mt-auto decoration-transparent">
                                <span className="text-2xl font-black text-white uppercase tracking-tighter italic opacity-80">DesiTrip</span>
                                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
                            </div>
                        </div>
                    </div>

                    {/* Floating Close Button */}
                    <Button
                        onClick={onClose}
                        variant="ghost"
                        className="absolute top-6 right-6 z-[30] w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center p-0"
                    >
                        <X className="w-5 h-5 text-white" />
                    </Button>

                    {/* Action Buttons (Not shared in image) */}
                    <div className="p-6 bg-[#0B0C0E] border-t border-white/10 flex gap-3 relative z-[20]">
                        <Button
                            onClick={handleShare}
                            disabled={isSharing}
                            className="flex-[3] bg-blue-600 hover:bg-blue-700 h-14 rounded-2xl gap-2 font-black uppercase tracking-widest text-[11px] shadow-lg shadow-blue-500/20"
                        >
                            <Share2 className="w-4 h-4 text-white" />
                            {isSharing ? 'Sharing...' : 'Share Memory'}
                        </Button>
                        <Button
                            onClick={handleDownload}
                            variant="outline"
                            className="flex-1 h-14 rounded-2xl border-white/20 hover:bg-white/10 bg-white/[0.05] flex flex-col items-center justify-center gap-1 group"
                        >
                            <Download className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                            <span className="text-[7px] font-black uppercase tracking-tight text-white/70">Save</span>
                        </Button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
