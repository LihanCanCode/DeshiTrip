"use client";

import Map, { Marker, NavigationControl, FullscreenControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin } from 'lucide-react';
import { useState } from 'react';

// NOTE: In a real app, this should be in an environment variable
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

interface Spot {
    _id: string;
    name: { en: string; bn: string };
    location: { coordinates: [number, number] };
}

export const TravelMap = ({ spots }: { spots: Spot[] }) => {
    const [viewState, setViewState] = useState({
        longitude: 91.8687, // Center on Sylhet
        latitude: 24.8949,
        zoom: 10
    });

    if (!MAPBOX_TOKEN) {
        return (
            <div className="w-full h-full bg-zinc-900 flex flex-col items-center justify-center text-zinc-500 rounded-[2.5rem] border border-white/5 p-12 text-center">
                <MapPin className="w-12 h-12 mb-4 opacity-20" />
                <h3 className="text-xl font-bold text-zinc-400">Map Preview</h3>
                <p className="max-w-xs mt-2 italic text-sm">
                    Mapbox token not found. Add NEXT_PUBLIC_MAPBOX_TOKEN to your .env to enable the interactive map.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full h-full rounded-[2.5rem] overflow-hidden border border-white/5 relative group">
            <Map
                {...viewState}
                onMove={evt => setViewState(evt.viewState)}
                mapStyle="mapbox://styles/mapbox/dark-v11"
                mapboxAccessToken={MAPBOX_TOKEN}
            >
                <NavigationControl position="top-right" />
                <FullscreenControl position="top-right" />

                {spots.map((spot) => (
                    <Marker
                        key={spot._id}
                        longitude={spot.location.coordinates[0]}
                        latitude={spot.location.coordinates[1]}
                        anchor="bottom"
                    >
                        <div className="group relative cursor-pointer">
                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-zinc-900 border border-white/10 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                {spot.name.en}
                            </div>
                            <MapPin className="w-8 h-8 text-emerald-500 hover:scale-125 transition-transform drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        </div>
                    </Marker>
                ))}
            </Map>
        </div>
    );
};
