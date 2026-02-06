"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import { useEffect } from 'react';

// Fix for default marker icons
const defaultIcon = new Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

// Custom icon for User Location (Red color)
const userIcon = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface Spot {
    _id: string;
    name: { en: string; bn: string };
    location: { coordinates: [number, number] };
}

interface LeafletMapProps {
    spots: Spot[];
    selectedSpot: Spot | null;
    userLocation: [number, number] | null;
    routeData: any;
    allRoutes: Record<string, any>;
}

// Component to handle FlyTo animation
const FlyToSpot = ({ spot }: { spot: Spot | null }) => {
    const map = useMap();

    useEffect(() => {
        if (spot) {
            map.flyTo([spot.location.coordinates[1], spot.location.coordinates[0]], 10, {
                duration: 2
            });
        }
    }, [spot, map]);

    return null;
};

export default function LeafletMap({ spots, selectedSpot, userLocation, routeData, allRoutes }: LeafletMapProps) {
    const defaultCenter: [number, number] = [23.8103, 90.4125]; // Center of Bangladesh (Dhaka)
    const zoom = 7;

    return (
        <MapContainer
            center={defaultCenter}
            zoom={zoom}
            style={{ height: '100%', width: '100%', borderRadius: '2.5rem' }}
            className="z-0"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <FlyToSpot spot={selectedSpot} />

            {/* Tourist Markers */}
            {spots.map((spot) => (
                <Marker
                    key={`marker-${spot._id}`}
                    position={[spot.location.coordinates[1], spot.location.coordinates[0]]}
                    icon={defaultIcon}
                >
                    <Popup className="font-sans font-bold text-sm">
                        {spot.name.en}
                    </Popup>
                </Marker>
            ))}

            {/* User Marker */}
            {userLocation && (
                <Marker position={[userLocation[1], userLocation[0]]} icon={userIcon}>
                    <Popup className="font-sans font-bold text-sm">You are here</Popup>
                </Marker>
            )}

            {/* Background Routes (Curated only) - Rendered with stability */}
            {Object.entries(allRoutes).map(([spotId, data]) => {
                // EXCLUDE the currently selected spot from background rendering to avoid overlap confusion
                if (selectedSpot && spotId === selectedSpot._id) return null;

                return (
                    <GeoJSON
                        key={`bg-route-${spotId}`}
                        data={data as any}
                        style={{ color: '#10b981', weight: 4, opacity: 0.25 }}
                    />
                );
            })}

            {/* ACTIVE SELECT ROUTE - Rendered ON TOP with high contrast */}
            {routeData && (
                <GeoJSON
                    key={`active-route-${selectedSpot?._id}-${JSON.stringify(routeData.properties?.summary)}`}
                    data={routeData as any}
                    style={{ color: '#ffffff', weight: 7, opacity: 1, dashArray: '1, 12', lineCap: 'round' }}
                >
                    {/* Outer glow effect via a second GeoJSON layer below if we wanted, but dashArray is cleaner for "active" look */}
                </GeoJSON>
            )}

            {/* Solid line below the dashed line for better visibility */}
            {routeData && (
                <GeoJSON
                    key={`active-route-solid-${selectedSpot?._id}`}
                    data={routeData as any}
                    style={{ color: '#10b981', weight: 8, opacity: 0.8 }}
                />
            )}
        </MapContainer>
    );
}
