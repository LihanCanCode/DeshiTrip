"use client";

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const RouteMap = dynamic(() => import('./RouteMap'), {
    ssr: false,
    loading: () => (
        <div className="glass p-8 rounded-[2.5rem] border-white/5 bg-white/[0.02] h-[500px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
                <p className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Loading Map...</p>
            </div>
        </div>
    ),
});

interface Location {
    day: number;
    name: string;
    coordinates: [number, number] | null;
    found: boolean;
}

interface Route {
    from: string;
    to: string;
    distance: string;
    estimatedTime: string;
}

interface ItineraryMapProps {
    locations: Location[];
    routes?: Route[];
}

export default function ItineraryMap({ locations, routes }: ItineraryMapProps) {
    return <RouteMap locations={locations} routes={routes} />;
}
