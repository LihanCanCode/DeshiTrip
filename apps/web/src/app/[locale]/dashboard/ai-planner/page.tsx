"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, MapPin, Calendar, Users, Loader2, ChevronDown, DollarSign, Clock, Utensils, Hotel, CheckCircle2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

interface TripPlan {
    tripOverview: {
        title: string;
        destination: string;
        duration: string;
        travelers: number;
        bestTimeToVisit: string;
    };
    itinerary: Array<{
        day: number;
        title: string;
        activities: Array<{
            time: string;
            activity: string;
            location: string;
            duration: string;
            cost: string;
            tips: string;
        }>;
        meals: {
            breakfast: string;
            lunch: string;
            dinner: string;
        };
        accommodation: {
            type: string;
            suggestion: string;
        };
    }>;
    budget: {
        accommodation: { perNight: number; total: number; description: string };
        food: { perDay: number; total: number; description: string };
        transportation: { total: number; description: string };
        activities: { total: number; description: string };
        miscellaneous: { total: number; description: string };
        grandTotal: number;
        perPerson: number;
        currency: string;
    };
    mustTryFood: Array<{
        item: string;
        description: string;
        cost: string;
    }>;
    essentialTips: string[];
    packingList: string[];
}

export default function AIPlannerPage() {
    const params = useParams();
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [days, setDays] = useState(3);
    const [people, setPeople] = useState(2);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [tripPlan, setTripPlan] = useState<TripPlan | null>(null);
    const [expandedDay, setExpandedDay] = useState<number | null>(null);
    const t = useTranslations('AIPlanner');

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setTripPlan(null);

        try {
            const token = localStorage.getItem("token");
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const response = await fetch(`${apiUrl}/api/ai-planner/generate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ from, to, days, people, locale: params.locale }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to generate trip plan");
            }

            setTripPlan(data.data);
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white">{t('title')}</h1>
                    <p className="text-zinc-400 mt-1">{t('subtitle')}</p>
                </div>
            </div>

            {/* Input Form */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8"
            >
                <form onSubmit={handleGenerate} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* From */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-zinc-300 mb-3">
                                <MapPin className="w-4 h-4 text-emerald-500" />
                                {t('from')}
                            </label>
                            <input
                                type="text"
                                value={from}
                                onChange={(e) => setFrom(e.target.value)}
                                placeholder="e.g., Dhaka"
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                            />
                        </div>

                        {/* To */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-zinc-300 mb-3">
                                <MapPin className="w-4 h-4 text-purple-500" />
                                {t('to')}
                            </label>
                            <input
                                type="text"
                                value={to}
                                onChange={(e) => setTo(e.target.value)}
                                placeholder="e.g., Cox's Bazar"
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                            />
                        </div>

                        {/* Days */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-zinc-300 mb-3">
                                <Calendar className="w-4 h-4 text-blue-500" />
                                {t('days')}
                            </label>
                            <input
                                type="number"
                                value={days}
                                onChange={(e) => setDays(Number(e.target.value))}
                                min="1"
                                max="30"
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            />
                        </div>

                        {/* People */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-zinc-300 mb-3">
                                <Users className="w-4 h-4 text-pink-500" />
                                {t('people')}
                            </label>
                            <input
                                type="number"
                                value={people}
                                onChange={(e) => setPeople(Number(e.target.value))}
                                min="1"
                                max="20"
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                {t('generating')}
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" />
                                {t('generate')}
                            </>
                        )}
                    </button>
                </form>

                {/* Error Message */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-4 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl"
                    >
                        {error}
                    </motion.div>
                )}
            </motion.div>

            {/* Trip Plan Display */}
            {tripPlan && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    {/* Overview */}
                    <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
                        <h2 className="text-2xl font-bold text-white mb-2">{tripPlan.tripOverview.title}</h2>
                        <div className="flex flex-wrap gap-4 text-sm text-zinc-300 mt-4">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-purple-500" />
                                {tripPlan.tripOverview.destination}
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-blue-500" />
                                {tripPlan.tripOverview.duration}
                            </div>
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-pink-500" />
                                {tripPlan.tripOverview.travelers} {tripPlan.tripOverview.travelers === 1 ? 'traveler' : 'travelers'}
                            </div>
                        </div>
                        <p className="text-zinc-400 mt-4">{tripPlan.tripOverview.bestTimeToVisit}</p>
                    </div>

                    {/* Budget Overview */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                            <DollarSign className="w-6 h-6 text-emerald-500" />
                            {t('budgetBreakdown')}
                        </h3>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                            {Object.entries(tripPlan.budget)
                                .filter(([key]) => !['grandTotal', 'perPerson', 'currency'].includes(key))
                                .map(([key, value]: [string, any]) => (
                                    <div key={key} className="bg-white/5 rounded-xl p-4 border border-white/5">
                                        <div className="text-xs uppercase text-zinc-500 mb-1">{key}</div>
                                        <div className="text-2xl font-bold text-white">৳{value.total.toLocaleString()}</div>
                                        <div className="text-xs text-zinc-400 mt-1">{value.description}</div>
                                    </div>
                                ))}
                        </div>

                        <div className="bg-gradient-to-r from-emerald-600/20 to-green-600/20 border border-emerald-500/30 rounded-xl p-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="text-sm text-emerald-300">Total Budget</div>
                                    <div className="text-3xl font-bold text-white">৳{tripPlan.budget.grandTotal.toLocaleString()}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-emerald-300">Per Person</div>
                                    <div className="text-2xl font-bold text-white">৳{tripPlan.budget.perPerson.toLocaleString()}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Itinerary */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-white flex items-center gap-3">
                            <Calendar className="w-6 h-6 text-blue-500" />
                            {t('itinerary')}
                        </h3>

                        {tripPlan.itinerary.map((day) => (
                            <motion.div
                                key={day.day}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden"
                            >
                                <button
                                    onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
                                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center font-bold text-white">
                                            {day.day}
                                        </div>
                                        <div className="text-left">
                                            <div className="font-bold text-white">{day.title}</div>
                                            <div className="text-sm text-zinc-400">{day.activities.length} activities planned</div>
                                        </div>
                                    </div>
                                    <ChevronDown
                                        className={`w-5 h-5 text-zinc-400 transition-transform ${expandedDay === day.day ? "rotate-180" : ""
                                            }`}
                                    />
                                </button>

                                {expandedDay === day.day && (
                                    <div className="px-6 pb-6 space-y-6">
                                        {/* Activities */}
                                        <div className="space-y-3">
                                            {day.activities.map((activity, idx) => (
                                                <div key={idx} className="bg-white/5 rounded-xl p-4 border border-white/5">
                                                    <div className="flex items-start gap-3">
                                                        <Clock className="w-5 h-5 text-blue-400 mt-0.5" />
                                                        <div className="flex-1">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div>
                                                                    <div className="font-semibold text-white">{activity.activity}</div>
                                                                    <div className="text-sm text-zinc-400">{activity.location}</div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="text-sm text-emerald-400 mb-1">{activity.time}</div>
                                                                    <div className="text-xs font-semibold bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full border border-emerald-500/20">
                                                                        {activity.cost}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="text-sm text-zinc-500">{activity.tips}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Meals */}
                                        <div className="bg-white/5 rounded-xl p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Utensils className="w-5 h-5 text-orange-400" />
                                                <div className="font-semibold text-white">{t('meals')}</div>
                                            </div>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex gap-2">
                                                    <span className="text-zinc-500 w-20">Breakfast:</span>
                                                    <span className="text-zinc-300">{day.meals.breakfast}</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <span className="text-zinc-500 w-20">Lunch:</span>
                                                    <span className="text-zinc-300">{day.meals.lunch}</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <span className="text-zinc-500 w-20">Dinner:</span>
                                                    <span className="text-zinc-300">{day.meals.dinner}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Accommodation */}
                                        <div className="bg-white/5 rounded-xl p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Hotel className="w-5 h-5 text-purple-400" />
                                                <div className="font-semibold text-white">{t('accommodation')}</div>
                                            </div>
                                            <div className="text-sm text-zinc-300">{day.accommodation.suggestion}</div>
                                            <div className="text-xs text-zinc-500 mt-1">{day.accommodation.type}</div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>

                    {/* Must Try Food */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                            <Utensils className="w-6 h-6 text-orange-500" />
                            {t('mustTryFood')}
                        </h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {tripPlan.mustTryFood?.map((food, idx) => (
                                <div key={idx} className="bg-white/5 rounded-xl p-4 border border-white/5 hover:bg-white/10 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="font-bold text-white">{food.item}</div>
                                        <div className="text-xs font-semibold bg-orange-500/10 text-orange-400 px-2 py-1 rounded-full border border-orange-500/20">
                                            {food.cost}
                                        </div>
                                    </div>
                                    <div className="text-sm text-zinc-400">{food.description}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tips & Packing */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Essential Tips */}
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4">{t('essentialTips')}</h3>
                            <ul className="space-y-2">
                                {tripPlan.essentialTips.map((tip, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-zinc-300">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                        <span>{tip}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Packing List */}
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4">{t('packingList')}</h3>
                            <ul className="space-y-2">
                                {tripPlan.packingList.map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-zinc-300">
                                        <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
