import { prisma } from "../lib/db";
import { CreateRideInput } from "../types/index.types";
import { calculateDistance, calculateFare, estimateDuration } from "./fareService";

function generateOtp(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export async function createRide(riderId: string, input: CreateRideInput) {
  const distance = calculateDistance(
    input.pickupLatitude, input.pickupLongitude,
    input.dropLatitude, input.dropLongitude
  );
  const fare = calculateFare(input.vehicleType as "BIKE" | "AUTO" | "CAR", distance);
  const duration = estimateDuration(distance);
  const otp = generateOtp();

  const ride = await prisma.ride.create({
    data: {
      riderId,
      pickupAddress: input.pickupAddress,
      pickupLatitude: input.pickupLatitude,
      pickupLongitude: input.pickupLongitude,
      dropAddress: input.dropAddress,
      dropLatitude: input.dropLatitude,
      dropLongitude: input.dropLongitude,
      fare,
      distance,
      duration,
      otp,
      status: "REQUESTED",
    },
    include: { rider: { select: { id: true, name: true, phone: true } } },
  });

  return ride;
}

export async function getRideById(rideId: string) {
  return prisma.ride.findUnique({
    where: { id: rideId },
    include: {
      rider: { select: { id: true, name: true, phone: true, avatar: true } },
      captain: { select: { id: true, name: true, phone: true, avatar: true, vehicleType: true, vehiclePlate: true, vehicleModel: true, vehicleColor: true, rating: true } },
      payment: true,
      rating: true,
    },
  });
}

export async function getUserRideHistory(userId: string, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const [rides, total] = await Promise.all([
    prisma.ride.findMany({
      where: { riderId: userId },
      include: {
        captain: { select: { id: true, name: true, vehicleType: true, vehiclePlate: true } },
        payment: { select: { status: true, amount: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.ride.count({ where: { riderId: userId } }),
  ]);

  return { rides, total, pages: Math.ceil(total / limit), page };
}

export async function acceptRide(rideId: string, captainId: string) {
  const ride = await prisma.ride.findUnique({ where: { id: rideId } });
  if (!ride || ride.status !== "REQUESTED") throw new Error("Ride not available");
  if (ride.captainId) throw new Error("Ride already accepted");

  return prisma.ride.update({
    where: { id: rideId },
    data: { captainId, status: "ACCEPTED" },
  });
}

export async function updateRideStatus(
  rideId: string,
  captainId: string,
  status: "CAPTAIN_ARRIVED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
) {
  const ride = await prisma.ride.findUnique({ where: { id: rideId } });
  if (!ride || ride.captainId !== captainId) throw new Error("Unauthorized");

  const data: Record<string, unknown> = { status };
  if (status === "IN_PROGRESS") data.startedAt = new Date();
  if (status === "COMPLETED") data.completedAt = new Date();

  return prisma.ride.update({ where: { id: rideId }, data });
}

export async function cancelRide(rideId: string, userId: string) {
  const ride = await prisma.ride.findUnique({ where: { id: rideId } });
  if (!ride) throw new Error("Ride not found");
  if (ride.riderId !== userId) throw new Error("Unauthorized");
  if (!["REQUESTED", "ACCEPTED"].includes(ride.status)) throw new Error("Cannot cancel this ride");

  return prisma.ride.update({ where: { id: rideId }, data: { status: "CANCELLED" } });
}

export async function getAvailableRides() {
  return prisma.ride.findMany({
    where: { status: "REQUESTED", captainId: null },
    include: {
      rider: { select: { id: true, name: true, avatar: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getCaptainRideHistory(captainId: string, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const [rides, total] = await Promise.all([
    prisma.ride.findMany({
      where: { captainId },
      include: {
        rider: { select: { id: true, name: true } },
        payment: { select: { status: true, amount: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.ride.count({ where: { captainId } }),
  ]);

  return { rides, total, pages: Math.ceil(total / limit), page };
}
