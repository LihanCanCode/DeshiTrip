"use client";

import DashboardLayout from "../dashboard/layout";
import { TravelMap } from "@/components/TravelMap";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Sparkles, Filter, Search, X } from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useParams, useRouter } from "next/navigation";

import { spotsData } from "@/data/spotsData";
import { SpotDetailModal } from "@/components/SpotDetailModal";
import type { Spot } from "@/data/spotsData";

const curatedSpots = spotsData;

export default function RecommendPage() {
    const t = useTranslations('Spots');
    const params = useParams();
    const router = useRouter();
    const locale = (params.locale as string) || 'en';
    const currentLocale = locale as 'en' | 'bn';

    const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [allRoutes, setAllRoutes] = useState<Record<string, any>>({});
    const [searchResults, setSearchResults] = useState<Spot[]>([]);
    const [searchRoutes, setSearchRoutes] = useState<Record<string, any>>({});
    const [routeMetrics, setRouteMetrics] = useState<{ distance: string; duration: string } | null>(null);
    const [loadingRoute, setLoadingRoute] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

    // Track fetched IDs to avoid redundant requests
    const fetchedIds = useRef<Set<string>>(new Set());

    // Auto-select spot from URL parameter
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const spotName = urlParams.get('spot');
            if (spotName) {
                const matchingSpot = curatedSpots.find(s => s.name.en === spotName || s.name.bn === spotName);
                if (matchingSpot) {
                    setSelectedSpot(matchingSpot);
                }
            }
        }
    }, []);

    // Get User Location
    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                setUserLocation([position.coords.longitude, position.coords.latitude]);
            }, (err) => console.error("Location access denied:", err));
        }
    }, []);

    // Improved Initial Load: Fetch routes for all curated spots deterministically
    useEffect(() => {
        if (userLocation) {
            const fetchAllRoutes = async () => {
                const apiKey = process.env.NEXT_PUBLIC_ORS_API_KEY;
                if (!apiKey || apiKey === 'your_open_route_service_api_key_here') return;

                const start = userLocation.join(',');

                // Identify spots that haven't been fetched yet
                const missingSpots = curatedSpots.filter(spot => !fetchedIds.current.has(spot._id));

                if (missingSpots.length === 0) return;

                console.log(`Fetching routes for ${missingSpots.length} missing spots...`);

                // Fetch individually to handle per-spot errors gracefully
                const routePromises = missingSpots.map(async (spot) => {
                    try {
                        const end = `${spot.location.coordinates[0]},${spot.location.coordinates[1]}`;
                        const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${start}&end=${end}`;
                        const res = await fetch(url);
                        if (!res.ok) throw new Error(`HTTP ${res.status}`);
                        const data = await res.json();
                        if (data.features && data.features.length > 0) {
                            fetchedIds.current.add(spot._id);
                            return { id: spot._id, data: data.features[0] };
                        }
                    } catch (err) {
                        console.error(`Failed to fetch route for ${spot.name.en}:`, err);
                    }
                    return null;
                });

                const results = await Promise.all(routePromises);
                const validRoutes = results.reduce((acc: Record<string, any>, curr) => {
                    if (curr) acc[curr.id] = curr.data;
                    return acc;
                }, {});

                if (Object.keys(validRoutes).length > 0) {
                    setAllRoutes(prev => ({ ...prev, ...validRoutes }));
                }
            };
            fetchAllRoutes();
        }
    }, [userLocation]); // Re-run if location changes

    // Debounced Search with stable place_id keys
    useEffect(() => {
        const delaySearch = setTimeout(async () => {
            if (searchQuery.length > 2) {
                setIsSearching(true);
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + " Bangladesh")}&limit=5`);
                    const data = await res.json();

                    const formattedResults = data.map((item: { place_id: string; display_name: string; lon: string; lat: string }) => {
                        const spotName = item.display_name.split(',')[0];

                        // Assign image if search matches known locations
                        let image: string | undefined;
                        if (spotName.toLowerCase().includes('rangamati')) {
                            image = '/images/spots/rangamati.jpeg';
                        }

                        return {
                            _id: `search-${item.place_id}`,
                            name: { en: spotName, bn: spotName },
                            location: { coordinates: [parseFloat(item.lon), parseFloat(item.lat)] },
                            image,
                            isSearchResult: true
                        };
                    });

                    setSearchResults(formattedResults);
                } catch (err) {
                    console.error("Search failed:", err);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 800);

        return () => clearTimeout(delaySearch);
    }, [searchQuery]);

    // Fetch individual route for search results if selected
    useEffect(() => {
        if (selectedSpot && selectedSpot.isSearchResult && userLocation && !searchRoutes[selectedSpot._id]) {
            setLoadingRoute(true);
            const fetchIndividual = async () => {
                try {
                    const apiKey = process.env.NEXT_PUBLIC_ORS_API_KEY;
                    if (!apiKey || apiKey === 'your_open_route_service_api_key_here') return;

                    const start = userLocation.join(',');
                    const end = `${selectedSpot.location.coordinates[0]},${selectedSpot.location.coordinates[1]}`;
                    const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${start}&end=${end}`;

                    const res = await fetch(url);
                    const data = await res.json();
                    if (data.features && data.features.length > 0) {
                        setSearchRoutes(prev => ({ ...prev, [selectedSpot._id]: data.features[0] }));
                    }
                } catch (err) {
                    console.error("Failed to fetch individual route:", err);
                } finally {
                    setLoadingRoute(false);
                }
            };
            fetchIndividual();
        }
    }, [selectedSpot, userLocation, searchRoutes]);

    // DERIVED STATE: Always get current route from active selection ID
    const currentRouteData = useMemo(() => {
        if (!selectedSpot) return null;
        const route = allRoutes[selectedSpot._id] || searchRoutes[selectedSpot._id];
        return route || null;
    }, [selectedSpot, allRoutes, searchRoutes]);

    // Update metrics when currentRouteData changes
    useEffect(() => {
        if (currentRouteData) {
            const props = currentRouteData.properties;
            const distKm = (props.summary.distance / 1000).toFixed(1);
            const durSecs = props.summary.duration;
            const hours = Math.floor(durSecs / 3600);
            const mins = Math.floor((durSecs % 3600) / 60);
            const durationStr = hours > 0 ? `${hours}h ${mins}m` : `${mins} min`;
            setRouteMetrics({ distance: `${distKm} km`, duration: durationStr });
            setLoadingRoute(false); // Clear loading if it was a search result
        } else if (selectedSpot && !loadingRoute && !allRoutes[selectedSpot._id]) {
            // If we selected something but have no route and not loading, we might want a null state
            setRouteMetrics(null);
        }
    }, [currentRouteData, selectedSpot, loadingRoute, allRoutes]);

    // Apply filters
    const filteredSpots = useMemo(() => {
        if (selectedFilters.length === 0) return curatedSpots;
        return curatedSpots.filter(spot => {
            const spotName = spot.name.en.toLowerCase();
            return selectedFilters.some(filter => {
                switch (filter) {
                    case 'sylhet': return spotName.includes('sylhet') || spotName.includes('srimangal') || spotName.includes('tanguar');
                    case 'chattogram': return spotName.includes('cox') || spotName.includes('bandarban') || spotName.includes('saint martin');
                    case 'khulna': return spotName.includes('sundarban') || spotName.includes('kuakata');
                    case 'rangamati': return spotName.includes('sajek');
                    case 'nature': return true; // All spots are nature-related
                    case 'beach': return spotName.includes('cox') || spotName.includes('kuakata') || spotName.includes('saint martin');
                    case 'hills': return spotName.includes('sajek') || spotName.includes('bandarban');
                    case 'forest': return spotName.includes('sundarban') || spotName.includes('tanguar') || spotName.includes('sylhet') || spotName.includes('srimangal');
                    default: return true;
                }
            });
        });
    }, [selectedFilters]);

    const displaySpots = searchQuery.length > 2 ? searchResults : filteredSpots;

    return (
        <DashboardLayout>
            <SpotDetailModal
                spot={selectedSpot}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />

            <div className="flex flex-col h-full gap-6 md:gap-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <div className="flex items-center gap-2 text-emerald-500 mb-2">
                            <Sparkles className="w-5 h-5" />
                            <span className="text-sm font-bold uppercase tracking-widest">{t('aiRecommendation')}</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black">{t('title')}</h1>
                        <p className="text-zinc-500 mt-2 text-sm md:text-base">{t('subtitle')}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                            <Input
                                placeholder={t('searchPlaceholder')}
                                className="pl-12 h-14 w-full"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {isSearching && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                            )}
                        </div>
                        <div className="relative">
                            <Button
                                variant="outline"
                                className="h-14 shrink-0"
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                            >
                                <Filter className="mr-2 w-5 h-5" />
                                {t('filters')}
                                {selectedFilters.length > 0 && (
                                    <span className="ml-2 px-2 py-0.5 bg-emerald-500 text-black rounded-full text-xs font-bold">
                                        {selectedFilters.length}
                                    </span>
                                )}
                            </Button>

                            {/* Filter Dropdown */}
                            {isFilterOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute right-0 top-full mt-2 w-72 bg-[#0a0f0d] border border-white/10 rounded-2xl p-4 shadow-2xl z-50"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-sm">Filter Spots</h3>
                                        {selectedFilters.length > 0 && (
                                            <button
                                                onClick={() => setSelectedFilters([])}
                                                className="text-xs text-emerald-500 hover:text-emerald-400"
                                            >
                                                Clear All
                                            </button>
                                        )}
                                    </div>

                                    {/* Region Filters */}
                                    <div className="mb-4">
                                        <p className="text-xs text-zinc-500 font-bold mb-2 uppercase tracking-wider">Region</p>
                                        <div className="flex flex-wrap gap-2">
                                            {[
                                                { id: 'sylhet', label: 'Sylhet' },
                                                { id: 'chattogram', label: 'Chattogram' },
                                                { id: 'khulna', label: 'Khulna' },
                                                { id: 'rangamati', label: 'Rangamati' },
                                            ].map(({ id, label }) => (
                                                <button
                                                    key={id}
                                                    onClick={() => {
                                                        setSelectedFilters(prev =>
                                                            prev.includes(id)
                                                                ? prev.filter(f => f !== id)
                                                                : [...prev, id]
                                                        );
                                                    }}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedFilters.includes(id)
                                                            ? 'bg-emerald-500 text-black'
                                                            : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                                                        }`}
                                                >
                                                    {label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Type Filters */}
                                    <div>
                                        <p className="text-xs text-zinc-500 font-bold mb-2 uppercase tracking-wider">Type</p>
                                        <div className="flex flex-wrap gap-2">
                                            {[
                                                { id: 'beach', label: '🏖️ Beach' },
                                                { id: 'hills', label: '⛰️ Hills' },
                                                { id: 'forest', label: '🌲 Forest' },
                                            ].map(({ id, label }) => (
                                                <button
                                                    key={id}
                                                    onClick={() => {
                                                        setSelectedFilters(prev =>
                                                            prev.includes(id)
                                                                ? prev.filter(f => f !== id)
                                                                : [...prev, id]
                                                        );
                                                    }}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedFilters.includes(id)
                                                            ? 'bg-emerald-500 text-black'
                                                            : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                                                        }`}
                                                >
                                                    {label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8 min-h-0 overflow-y-auto lg:overflow-visible pb-10">
                    <div className="lg:col-span-1 space-y-6 lg:overflow-y-auto pr-0 lg:pr-2 custom-scrollbar order-2 lg:order-1">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            {searchQuery.length > 2 ? t('searchResults') : t('topDestinations')}
                        </h3>

                        <div className="space-y-4">
                            {displaySpots.length === 0 && searchQuery.length > 2 && !isSearching && (
                                <p className="text-zinc-500 italic">{t('noPlacesFound')}</p>
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
                                        }`}>{spot.name[currentLocale] || spot.name.en}</h4>

                                    {selectedSpot?._id === spot._id && routeMetrics ? (
                                        <p className="text-emerald-400 text-sm mt-1 font-bold animate-pulse">
                                            {routeMetrics.distance} • {routeMetrics.duration} {t('drive')}
                                        </p>
                                    ) : (
                                        <p className="text-zinc-500 text-sm mt-1">
                                            {spot.location.coordinates[1].toFixed(2)}, {spot.location.coordinates[0].toFixed(2)}
                                        </p>
                                    )}

                                    <div className="flex gap-2 mt-4">
                                        <span className="px-2 py-1 bg-zinc-800 rounded-md text-[10px] uppercase font-bold text-zinc-400 tracking-tighter">{t('nature')}</span>
                                        <span className="px-2 py-1 bg-zinc-800 rounded-md text-[10px] uppercase font-bold text-zinc-400 tracking-tighter">{t('budgetFriendly')}</span>
                                    </div>

                                    {selectedSpot?._id === spot._id && (
                                        <div className="mt-4 flex flex-col gap-2">
                                            <div className="text-xs text-emerald-500 font-bold flex items-center gap-1">
                                                {loadingRoute && !currentRouteData ? t('calculatingRoute') : t('viewingRoute')} <span className="animate-pulse">●</span>
                                            </div>

                                            {(('tourPlan' in spot) || spot.isSearchResult) && (
                                                <Button
                                                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-xl flex items-center justify-center gap-2"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const destination = spot.name[currentLocale] || spot.name.en;
                                                        router.push(`/${locale}/dashboard/ai-planner?to=${encodeURIComponent(destination)}`);
                                                    }}
                                                >
                                                    <Sparkles className="w-4 h-4" />
                                                    {t('planWithAI')}
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-3 min-h-[400px] md:min-h-[500px] order-1 lg:order-2 space-y-4">
                        {/* Hero Image Banner */}
                        {selectedSpot && selectedSpot.image && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                                className="relative h-56 md:h-64 rounded-3xl overflow-hidden border border-white/5 shadow-2xl"
                            >
                                <img
                                    src={selectedSpot.image}
                                    alt={selectedSpot.name[currentLocale]}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                <div className="absolute bottom-6 left-6 right-6">
                                    <h2 className="text-3xl md:text-4xl font-black text-white mb-2">
                                        {selectedSpot.name[currentLocale] || selectedSpot.name.en}
                                    </h2>
                                    {routeMetrics && (
                                        <div className="flex items-center gap-4 text-emerald-400 text-sm font-bold">
                                            <span className="flex items-center gap-1">
                                                <span>📍</span> {routeMetrics.distance}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <span>🚗</span> {routeMetrics.duration} {t('drive')}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        <TravelMap
                            spots={displaySpots}
                            selectedSpot={selectedSpot}
                            userLocation={userLocation}
                            routeData={currentRouteData}
                            allRoutes={allRoutes}
                        />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
