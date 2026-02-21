import { VehicleType, FareEstimate } from "../types/index.types";
import { FARE_PER_KM, BASE_FARE } from "../utils/constants";

/**
 * Haversine formula to calculate distance between two coordinates in km
 */
export function calculateDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

/**
 * Estimate duration in minutes based on distance
 */
export function estimateDuration(distanceKm: number): number {
  const avgSpeedKmh = 25;
  return Math.ceil((distanceKm / avgSpeedKmh) * 60);
}

/**
 * Calculate fare for a given vehicle type and distance
 */
export function calculateFare(vehicleType: VehicleType, distanceKm: number): number {
  const base = BASE_FARE[vehicleType];
  const perKm = FARE_PER_KM[vehicleType];
  return parseFloat((base + perKm * distanceKm).toFixed(2));
}

/**
 * Return fare estimates for all vehicle types
 */
export function getFareEstimate(
  pickupLat: number, pickupLon: number,
  dropLat: number, dropLon: number
): FareEstimate {
  const distance = calculateDistance(pickupLat, pickupLon, dropLat, dropLon);
  const duration = estimateDuration(distance);

  return {
    bike: calculateFare("BIKE", distance),
    auto: calculateFare("AUTO", distance),
    car: calculateFare("CAR", distance),
    distance,
    duration,
  };
}
