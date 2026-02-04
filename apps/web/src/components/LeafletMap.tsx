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
}

// Component to handle FlyTo animation
const FlyToSpot = ({ spot }: { spot: Spot | null }) => {
    const map = useMap();

    useEffect(() => {
        if (spot) {
            map.flyTo([spot.location.coordinates[1], spot.location.coordinates[0]], 12, {
                duration: 2 // smooth animation duration in seconds
            });
        }
    }, [spot, map]);

    return null;
};

export default function LeafletMap({ spots, selectedSpot, userLocation, routeData }: LeafletMapProps) {
    const center: [number, number] = [24.8949, 91.8687]; // Default to Sylhet
    const zoom = 8;

    return (
        <MapContainer
            center={center}
            zoom={zoom}
            style={{ height: '100%', width: '100%', borderRadius: '2.5rem' }}
            className="z-0"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Logic Components */}
            <FlyToSpot spot={selectedSpot} />

            {/* Tourist Spots */}
            {spots.map((spot) => (
                <Marker
                    key={spot._id}
                    position={[spot.location.coordinates[1], spot.location.coordinates[0]]}
                    icon={defaultIcon}
                >
                    <Popup className="font-sans font-bold text-sm">
                        {spot.name.en}
                    </Popup>
                </Marker>
            ))}

            {/* User Location Marker */}
            {userLocation && (
                <Marker position={[userLocation[1], userLocation[0]]} icon={userIcon}>
                    <Popup className="font-sans font-bold text-sm">You are here</Popup>
                </Marker>
            )}

            {/* Render Actual Road Route */}
            {routeData && (
                <GeoJSON
                    data={routeData}
                    style={{ color: '#10b981', weight: 5, opacity: 0.8 }}
                />
            )}
        </MapContainer>
    );
}
