"use client";

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Dynamically import LeafletMap with SSR disabled
const LeafletMap = dynamic(() => import('./LeafletMap'), {
    loading: () => (
        <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900/50 text-zinc-500">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <p className="text-xs font-bold uppercase tracking-widest">Loading Map...</p>
        </div>
    ),
    ssr: false
});

interface Spot {
    _id: string;
    name: { en: string; bn: string };
    location: { coordinates: [number, number] };
}

interface TravelMapProps {
    spots: Spot[];
    selectedSpot?: Spot | null;
    userLocation?: [number, number] | null;
    routeData?: any;
}

export const TravelMap = ({ spots, selectedSpot = null, userLocation = null, routeData = null }: TravelMapProps) => {
    return (
        <div className="w-full h-full rounded-[2.5rem] overflow-hidden border border-white/5 relative bg-zinc-900">
            <LeafletMap
                spots={spots}
                selectedSpot={selectedSpot}
                userLocation={userLocation}
                routeData={routeData}
            />
        </div>
    );
};
