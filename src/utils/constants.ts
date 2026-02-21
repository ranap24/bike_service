export const FARE_PER_KM = {
  BIKE: 8,
  AUTO: 12,
  CAR: 18,
} as const;

export const BASE_FARE = {
  BIKE: 30,
  AUTO: 50,
  CAR: 80,
} as const;

export const RIDE_TIMEOUT_MINUTES = 5;

export const OTP_EXPIRY_MINUTES = 10;

export const ACCESS_TOKEN_EXPIRY = "15m";
export const REFRESH_TOKEN_EXPIRY_DAYS = 7;

export const MAX_SEARCH_RADIUS_KM = 10;

export const CURRENCY = "INR";

export const APP_NAME = "BikeService";
export const APP_TAGLINE = "Your ride, your way.";
