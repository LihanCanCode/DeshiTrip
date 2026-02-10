/**
 * Calculate distance between two geographic coordinates using Haversine formula
 * @param lat1 Latitude of point 1
 * @param lon1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lon2 Longitude of point 2
 * @returns Distance in kilometers
 */
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 10) / 10; // Round to 1 decimal place
};

/**
 * Convert degrees to radians
 */
const toRadians = (degrees: number): number => {
    return degrees * (Math.PI / 180);
};

/**
 * Calculate estimated travel time based on distance
 * Average speed: 50 km/h for Bangladesh roads (considering traffic and road conditions)
 * @param distanceKm Distance in kilometers
 * @returns Estimated time in hours (rounded to 1 decimal)
 */
export const calculateTravelTime = (distanceKm: number): number => {
    const avgSpeedKmh = 50;
    const timeHours = distanceKm / avgSpeedKmh;
    return Math.round(timeHours * 10) / 10;
};

/**
 * Format travel time into human-readable string
 * @param hours Time in hours
 * @returns Formatted string like "2h 30m"
 */
export const formatTravelTime = (hours: number): string => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);

    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
};
