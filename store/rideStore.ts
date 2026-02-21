"use client";

import { create } from "zustand";
import { Ride, Location, VehicleType } from "../types/index.types";

interface RideStore {
  activeRide: Ride | null;
  pickup: Location | null;
  drop: Location | null;
  selectedVehicle: VehicleType;
  captainLocation: { lat: number; lng: number } | null;
  setActiveRide: (ride: Ride | null) => void;
  setPickup: (pickup: Location | null) => void;
  setDrop: (drop: Location | null) => void;
  setSelectedVehicle: (vehicle: VehicleType) => void;
  setCaptainLocation: (loc: { lat: number; lng: number } | null) => void;
  clearRide: () => void;
}

export const useRideStore = create<RideStore>((set) => ({
  activeRide: null,
  pickup: null,
  drop: null,
  selectedVehicle: "BIKE",
  captainLocation: null,
  setActiveRide: (ride) => set({ activeRide: ride }),
  setPickup: (pickup) => set({ pickup }),
  setDrop: (drop) => set({ drop }),
  setSelectedVehicle: (vehicle) => set({ selectedVehicle: vehicle }),
  setCaptainLocation: (loc) => set({ captainLocation: loc }),
  clearRide: () => set({ activeRide: null, pickup: null, drop: null, captainLocation: null }),
}));
