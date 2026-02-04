"use client";

import DashboardLayout from "../dashboard/layout";
import { TravelMap } from "@/components/TravelMap";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Sparkles, Filter, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

import { spotsData, Spot } from "@/data/spotsData";
import { SpotDetailModal } from "@/components/SpotDetailModal";

// Use imported spotsData instead of local mockSpots
const initialSpots = spotsData;

export default function RecommendPage() {
    const t = useTranslations('Index');
    const [selectedSpot, setSelectedSpot] = useState<any>(null);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [routeData, setRouteData] = useState<any>(null);
    const [routeMetrics, setRouteMetrics] = useState<{ distance: string; duration: string } | null>(null);
    const [loadingRoute, setLoadingRoute] = useState(false);

    // Search State
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Get User Location
    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                setUserLocation([position.coords.longitude, position.coords.latitude]);
            });
        }
    }, []);

    // Search Function (Nominatim)
    useEffect(() => {
        const delaySearch = setTimeout(async () => {
            if (searchQuery.length > 2) {
                setIsSearching(true);
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + " Bangladesh")}&limit=5`);
                    const data = await res.json();

                    const formattedResults = data.map((item: any, index: number) => ({
                        _id: `search-${index}`,
                        name: { en: item.display_name.split(',')[0], bn: item.display_name.split(',')[0] },
                        location: { coordinates: [parseFloat(item.lon), parseFloat(item.lat)] },
                        isSearchResult: true
                        // Note: Search results won't have 'tourPlan' data yet
                    }));

                    setSearchResults(formattedResults);
                } catch (error) {
                    console.error("Search failed:", error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 800); // 800ms debounce

        return () => clearTimeout(delaySearch);
    }, [searchQuery]);

    // Fetch Route when spot selected
    useEffect(() => {
        if (selectedSpot && userLocation) {
            setLoadingRoute(true);
            const fetchRoute = async () => {
                try {
                    // Try to generate route even if no key to show "straight line" at least? 
                    // No, ORS logic handles the fetch. If no key, sidebar shows "Add Key".
                    const apiKey = process.env.NEXT_PUBLIC_ORS_API_KEY;
                    if (!apiKey || apiKey === 'your_open_route_service_api_key_here') {
                        // console.warn("ORS API Key missing"); 
                        // Only warn once or handle gracefully.
                        if (!routeMetrics) {
                            setRouteMetrics({ distance: "Calculating...", duration: "Add API Key" });
                        }
                        setLoadingRoute(false);
                        return;
                    }

                    const start = userLocation.join(',');
                    const end = `${selectedSpot.location.coordinates[0]},${selectedSpot.location.coordinates[1]}`;
                    const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${start}&end=${end}`;

                    const res = await fetch(url);
                    const data = await res.json();

                    if (data.features && data.features.length > 0) {
                        setRouteData(data.features[0]);
                        const props = data.features[0].properties;

                        // Distance in km
                        const distKm = (props.summary.distance / 1000).toFixed(1);

                        // Duration
                        const durSecs = props.summary.duration;
                        const hours = Math.floor(durSecs / 3600);
                        const mins = Math.floor((durSecs % 3600) / 60);
                        const durationStr = hours > 0 ? `${hours}h ${mins}m` : `${mins} min`;

                        setRouteMetrics({ distance: `${distKm} km`, duration: durationStr });
                    }
                } catch (error) {
                    console.error("Failed to fetch route:", error);
                } finally {
                    setLoadingRoute(false);
                }
            };
            fetchRoute();
        } else {
            setRouteData(null);
            setRouteMetrics(null);
        }
    }, [selectedSpot, userLocation]);

    // List to display
    const displaySpots = searchQuery.length > 2 ? searchResults : initialSpots;

    return (
        <DashboardLayout>
            <SpotDetailModal
                spot={selectedSpot}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />

            <div className="flex flex-col h-full gap-8">
                <div className="flex justify-between items-end">
                    <div>
                        <div className="flex items-center gap-2 text-emerald-500 mb-2">
                            <Sparkles className="w-5 h-5" />
                            <span className="text-sm font-bold uppercase tracking-widest">AI Recommendations</span>
                        </div>
                        <h1 className="text-4xl font-black">Find Your Next Spot</h1>
                        <p className="text-zinc-500 mt-2">Discover curated tour plans & expenses.</p>
                    </div>

                    <div className="flex gap-4">
                        <div className="relative w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                            <Input
                                placeholder="Search places (e.g., Sajek)..."
                                className="pl-12 h-14"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {isSearching && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                            )}
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
                            {searchQuery.length > 2 ? 'Search Results' : <>Top <span className="text-emerald-500">Destinations</span></>}
                        </h3>

                        <div className="space-y-4">
                            {displaySpots.length === 0 && searchQuery.length > 2 && !isSearching && (
                                <p className="text-zinc-500 italic">No places found.</p>
                            )}

                            {displaySpots.map((spot, i) => (
                                <motion.div
                                    key={spot._id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    onClick={() => setSelectedSpot(spot)}
                                    className={`glass p-5 rounded-3xl border transition-all cursor-pointer group ${selectedSpot?._id === spot._id
                                            ? 'bg-emerald-900/20 border-emerald-500/50 ring-1 ring-emerald-500'
                                            : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04]'
                                        }`}
                                >
                                    <h4 className={`font-bold text-lg transition-colors ${selectedSpot?._id === spot._id ? 'text-emerald-400' : 'group-hover:text-emerald-400'
                                        }`}>{spot.name.en}</h4>

                                    {/* Dynamic Metrics */}
                                    {selectedSpot?._id === spot._id && routeMetrics ? (
                                        <p className="text-emerald-400 text-sm mt-1 font-bold animate-pulse">
                                            {routeMetrics.distance} • {routeMetrics.duration} drive
                                        </p>
                                    ) : (
                                        <p className="text-zinc-500 text-sm mt-1">
                                            {spot.location.coordinates[1].toFixed(2)}, {spot.location.coordinates[0].toFixed(2)}
                                        </p>
                                    )}

                                    <div className="flex gap-2 mt-4">
                                        <span className="px-2 py-1 bg-zinc-800 rounded-md text-[10px] uppercase font-bold text-zinc-400 tracking-tighter">Nature</span>
                                        <span className="px-2 py-1 bg-zinc-800 rounded-md text-[10px] uppercase font-bold text-zinc-400 tracking-tighter">Budget Friendly</span>
                                    </div>

                                    {selectedSpot?._id === spot._id && (
                                        <div className="mt-4 flex flex-col gap-2">
                                            <div className="text-xs text-emerald-500 font-bold flex items-center gap-1">
                                                {loadingRoute ? 'Calculating Route...' : 'Viewing Route'} <span className="animate-pulse">●</span>
                                            </div>

                                            {/* Tour Plan Button (Only for rich data spots) */}
                                            {'tourPlan' in spot && (
                                                <Button
                                                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-xl"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedSpot(spot);
                                                        setIsModalOpen(true);
                                                    }}
                                                >
                                                    View Tour Plan & Cost
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>

                        {!searchQuery && (
                            <div className="p-6 rounded-[2rem] bg-gradient-to-br from-emerald-600/20 to-teal-900/20 border border-emerald-500/10">
                                <h4 className="font-bold mb-2 text-emerald-400">Pro Tip</h4>
                                <p className="text-sm text-zinc-400 leading-relaxed">
                                    Click "View Tour Plan" on any top destination to see detailed transport options and budget estimates!
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Map Area */}
                    <div className="lg:col-span-3 min-h-[500px]">
                        <TravelMap
                            spots={displaySpots as any}
                            selectedSpot={selectedSpot}
                            userLocation={userLocation}
                            routeData={routeData}
                        />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
