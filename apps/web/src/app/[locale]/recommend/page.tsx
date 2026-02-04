"use client";

import DashboardLayout from "../dashboard/layout";
import { TravelMap } from "@/components/TravelMap";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Sparkles, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

// Mock spots for visualization
const mockSpots = [
    { _id: '1', name: { en: 'Ratargul', bn: 'রাতারগুল' }, location: { coordinates: [91.9333, 24.9833] } },
    { _id: '2', name: { en: 'Cox\'s Bazar', bn: 'কক্সবাজার' }, location: { coordinates: [91.9760, 21.4272] } },
    { _id: '3', name: { en: 'Sundarbans', bn: 'সুন্দরবন' }, location: { coordinates: [89.3950, 21.9497] } },
];

export default function RecommendPage() {
    const t = useTranslations('Index');

    return (
        <DashboardLayout>
            <div className="flex flex-col h-full gap-8">
                <div className="flex justify-between items-end">
                    <div>
                        <div className="flex items-center gap-2 text-emerald-500 mb-2">
                            <Sparkles className="w-5 h-5" />
                            <span className="text-sm font-bold uppercase tracking-widest">AI Recommendations</span>
                        </div>
                        <h1 className="text-4xl font-black">Find Your Next Spot</h1>
                    </div>

                    <div className="flex gap-4">
                        <div className="relative w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                            <Input placeholder="Search districts or tags..." className="pl-12 h-14" />
                        </div>
                        <Button variant="outline" className="h-14">
                            <Filter className="mr-2 w-5 h-5" />
                            Filters
                        </Button>
                    </div>
                </div>

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8 min-h-0">
                    {/* Sidebar Filters / Info */}
                    <div className="lg:col-span-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            Best for <span className="text-emerald-500">Monsoon</span>
                        </h3>

                        <div className="space-y-4">
                            {mockSpots.map((spot, i) => (
                                <motion.div
                                    key={spot._id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="glass p-5 rounded-3xl border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all cursor-pointer group"
                                >
                                    <h4 className="font-bold text-lg group-hover:text-emerald-400 transition-colors">{spot.name.en}</h4>
                                    <p className="text-zinc-500 text-sm mt-1">Sylhet District • 2.5 hours away</p>
                                    <div className="flex gap-2 mt-4">
                                        <span className="px-2 py-1 bg-zinc-800 rounded-md text-[10px] uppercase font-bold text-zinc-400 tracking-tighter">Nature</span>
                                        <span className="px-2 py-1 bg-zinc-800 rounded-md text-[10px] uppercase font-bold text-zinc-400 tracking-tighter">Budget Friendly</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="p-6 rounded-[2rem] bg-gradient-to-br from-emerald-600/20 to-teal-900/20 border border-emerald-500/10">
                            <h4 className="font-bold mb-2 text-emerald-400">Pro Tip</h4>
                            <p className="text-sm text-zinc-400 leading-relaxed">
                                Ratargul is best visited during Monsoon when the water level is high. Don't forget to hire a local boat!
                            </p>
                        </div>
                    </div>

                    {/* Map Area */}
                    <div className="lg:col-span-3 min-h-[500px]">
                        <TravelMap spots={mockSpots as any} />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
