"use client";

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Dynamically import MapComponent with SSR disabled
const MapComponent = dynamic(() => import('./MapComponent'), {
    loading: () => (
        <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900/50 text-zinc-500">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <p className="text-xs font-bold uppercase tracking-widest">Loading Map...</p>
        </div>
    ),
    ssr: false
});

import { Spot } from './MapComponent';
import { FeatureCollection, Feature, Geometry } from 'geojson';

interface TravelMapProps {
    spots: Spot[];
    selectedSpot?: Spot | null;
    userLocation?: [number, number] | null;
    routeData?: FeatureCollection | Feature | Geometry | null;
    allRoutes?: Record<string, FeatureCollection | Feature | Geometry>;
}

export const TravelMap = ({ spots, selectedSpot = null, userLocation = null, routeData = null, allRoutes = {} }: TravelMapProps) => {
    return (
        <div className="w-full h-full rounded-[2.5rem] overflow-hidden border border-white/5 relative bg-zinc-900">
            <MapComponent
                spots={spots}
                selectedSpot={selectedSpot}
                userLocation={userLocation}
                routeData={routeData}
                allRoutes={allRoutes}
            />
        </div>
    );
};
