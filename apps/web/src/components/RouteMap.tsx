"use client";

import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { DivIcon } from 'leaflet';
import { useEffect } from 'react';

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

interface RouteMapProps {
    locations: Location[];
    routes?: Route[];
}

// Create custom numbered marker icon
const createDayMarker = (day: number) => {
    return new DivIcon({
        className: 'custom-day-marker',
        html: `
            <div class="relative flex items-center justify-center w-10 h-10">
                <div class="absolute w-full h-full bg-emerald-500 rounded-full shadow-lg animate-pulse opacity-30"></div>
                <div class="relative bg-emerald-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-black text-sm border-2 border-white shadow-xl">
                    ${day}
                </div>
            </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20]
    });
};

// Component to handle map fitting
const FitBounds = ({ locations }: { locations: Location[] }) => {
    const map = useMap();

    useEffect(() => {
        if (locations.length > 0) {
            const bounds = locations
                .filter(loc => loc.coordinates)
                .map(loc => [loc.coordinates[1], loc.coordinates[0]] as [number, number]);

            if (bounds.length > 0) {
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
            }
        }
    }, [locations, map]);

    return null;
};

export default function RouteMap({ locations, routes = [] }: RouteMapProps) {
    const defaultCenter: [number, number] = [23.8103, 90.4125]; // Dhaka

    // Filter valid locations
    const validLocations = locations.filter(loc => loc.coordinates && loc.found);

    // Prepare polyline paths
    const paths = [];
    for (let i = 0; i < validLocations.length - 1; i++) {
        const current = validLocations[i];
        const next = validLocations[i + 1];

        if (current.coordinates && next.coordinates) {
            paths.push([
                [current.coordinates[1], current.coordinates[0]],
                [next.coordinates[1], next.coordinates[0]]
            ]);
        }
    }

    return (
        <div className="glass p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border-white/5 bg-white/[0.02] overflow-hidden">
            <div className="mb-6">
                <h3 className="text-xl md:text-2xl font-black tracking-tight text-white uppercase mb-2">
                    Route Visualization
                </h3>
                <p className="text-xs md:text-sm text-zinc-400">
                    {validLocations.length} {validLocations.length === 1 ? 'destination' : 'destinations'} mapped
                </p>
            </div>

            <div className="h-[400px] md:h-[500px] rounded-2xl overflow-hidden border border-white/10">
                <MapContainer
                    center={defaultCenter}
                    zoom={7}
                    style={{ height: '100%', width: '100%' }}
                    className="z-0"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <FitBounds locations={validLocations} />

                    {/* Route Polylines */}
                    {paths.map((path, index) => (
                        <Polyline
                            key={`route-${index}`}
                            positions={path as any}
                            pathOptions={{
                                color: '#10b981',
                                weight: 4,
                                opacity: 0.8,
                                dashArray: '10, 10'
                            }}
                        />
                    ))}

                    {/* Day Markers */}
                    {validLocations.map((location) => (
                        <Marker
                            key={`marker-${location.day}`}
                            position={[location.coordinates[1], location.coordinates[0]]}
                            icon={createDayMarker(location.day)}
                        >
                            <Popup className="font-sans">
                                <div className="p-2">
                                    <h4 className="font-black text-emerald-600 text-sm mb-1">
                                        Day {location.day}
                                    </h4>
                                    <p className="font-bold text-zinc-800 text-xs">
                                        {location.name}
                                    </p>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>

            {/* Route Info */}
            {routes && routes.length > 0 && (
                <div className="mt-6 space-y-3">
                    <h4 className="text-sm font-black uppercase tracking-wider text-zinc-400">
                        Travel Distances
                    </h4>
                    {routes.map((route, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5"
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white">
                                    {route.from} → {route.to}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-[10px] font-black uppercase">
                                <span className="text-emerald-400">{route.distance}</span>
                                <span className="text-zinc-500">•</span>
                                <span className="text-blue-400">~{route.estimatedTime}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
