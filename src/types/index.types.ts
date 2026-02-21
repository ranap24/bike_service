export type UserRole = "RIDER" | "CAPTAIN" | "ADMIN";
export type RideStatus =
  | "REQUESTED"
  | "ACCEPTED"
  | "CAPTAIN_ARRIVED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";
export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
export type VehicleType = "BIKE" | "AUTO" | "CAR";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Captain {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  isActive: boolean;
  isOnline: boolean;
  isVerified: boolean;
  vehicleType: VehicleType;
  vehiclePlate: string;
  vehicleModel: string;
  vehicleColor: string;
  currentLatitude?: number;
  currentLongitude?: number;
  rating: number;
  totalRides: number;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  address: string;
  latitude: number;
  longitude: number;
}

export interface Ride {
  id: string;
  riderId: string;
  captainId?: string;
  rider?: Pick<User, "id" | "name" | "phone" | "avatar"> | null;
  captain?: Pick<Captain, "id" | "name" | "phone" | "avatar" | "vehicleType" | "vehiclePlate" | "vehicleModel" | "vehicleColor" | "rating"> | null;
  // Flat address fields (as returned by SQL)
  pickupAddress: string;
  pickupLatitude: number;
  pickupLongitude: number;
  dropAddress: string;
  dropLatitude: number;
  dropLongitude: number;
  status: RideStatus;
  fare: number;
  distance: number;
  duration: number;
  otp?: string;
  startedAt?: string;
  completedAt?: string;
  payment?: Payment;
  rating?: Rating;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  rideId: string;
  userId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  stripePaymentIntentId?: string;
  paidAt?: string;
  createdAt: string;
}

export interface Rating {
  id: string;
  rideId: string;
  userId: string;
  captainId: string;
  riderRating?: number;
  captainRating?: number;
  riderComment?: string;
  captainComment?: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthSession {
  user?: User;
  captain?: Captain;
  accessToken: string;
  role: UserRole;
}

export interface FareEstimate {
  bike: number;
  auto: number;
  car: number;
  distance: number;
  duration: number;
}

export interface CreateRideInput {
  pickupAddress: string;
  pickupLatitude: number;
  pickupLongitude: number;
  dropAddress: string;
  dropLatitude: number;
  dropLongitude: number;
  vehicleType: VehicleType;
}

export interface RegisterUserInput {
  name: string;
  email: string;
  phone?: string;
  password: string;
}

export interface RegisterCaptainInput {
  name: string;
  email: string;
  phone: string;
  password: string;
  vehicleType: VehicleType;
  vehiclePlate: string;
  vehicleModel: string;
  vehicleColor: string;
}

export interface LoginInput {
  email: string;
  password: string;
}
