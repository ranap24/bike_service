import { sql } from "../lib/db";
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
  const id = crypto.randomUUID();

  const rows = await sql`
    INSERT INTO rides (
      id, rider_id, pickup_address, pickup_latitude, pickup_longitude,
      drop_address, drop_latitude, drop_longitude,
      fare, distance, duration, otp, status
    ) VALUES (
      ${id}, ${riderId}, ${input.pickupAddress}, ${input.pickupLatitude}, ${input.pickupLongitude},
      ${input.dropAddress}, ${input.dropLatitude}, ${input.dropLongitude},
      ${fare}, ${distance}, ${duration}, ${otp}, 'REQUESTED'
    )
    RETURNING *
  `;

  const rider = await sql`SELECT id, name, phone FROM users WHERE id = ${riderId} LIMIT 1`;
  return { ...rows[0], rider: rider[0] ?? null };
}

export async function getRideById(rideId: string) {
  const rides = await sql`
    SELECT
      r.*,
      json_build_object('id', u.id, 'name', u.name, 'phone', u.phone, 'avatar', u.avatar) AS rider,
      CASE WHEN c.id IS NOT NULL THEN
        json_build_object(
          'id', c.id, 'name', c.name, 'phone', c.phone, 'avatar', c.avatar,
          'vehicleType', c.vehicle_type, 'vehiclePlate', c.vehicle_plate,
          'vehicleModel', c.vehicle_model, 'vehicleColor', c.vehicle_color,
          'rating', c.rating
        )
      ELSE NULL END AS captain
    FROM rides r
    LEFT JOIN users u ON u.id = r.rider_id
    LEFT JOIN captains c ON c.id = r.captain_id
    WHERE r.id = ${rideId}
    LIMIT 1
  `;
  return rides[0] ?? null;
}

export async function getUserRideHistory(userId: string, page = 1, limit = 10) {
  const offset = (page - 1) * limit;
  const rides = await sql`
    SELECT
      r.*,
      json_build_object('id', c.id, 'name', c.name, 'vehicleType', c.vehicle_type, 'vehiclePlate', c.vehicle_plate) AS captain
    FROM rides r
    LEFT JOIN captains c ON c.id = r.captain_id
    WHERE r.rider_id = ${userId}
    ORDER BY r.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  const totals = await sql`SELECT COUNT(*)::int AS count FROM rides WHERE rider_id = ${userId}`;
  const total = totals[0]?.count ?? 0;
  return { rides, total, pages: Math.ceil(total / limit), page };
}

export async function acceptRide(rideId: string, captainId: string) {
  const existing = await sql`SELECT status, captain_id FROM rides WHERE id = ${rideId} LIMIT 1`;
  const ride = existing[0];
  if (!ride || ride.status !== "REQUESTED") throw new Error("Ride not available");
  if (ride.captain_id) throw new Error("Ride already accepted");

  const rows = await sql`
    UPDATE rides SET captain_id = ${captainId}, status = 'ACCEPTED', updated_at = NOW()
    WHERE id = ${rideId}
    RETURNING *
  `;
  return rows[0];
}

export async function updateRideStatus(
  rideId: string,
  captainId: string,
  status: "CAPTAIN_ARRIVED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
) {
  const existing = await sql`SELECT captain_id FROM rides WHERE id = ${rideId} LIMIT 1`;
  const ride = existing[0];
  if (!ride || ride.captain_id !== captainId) throw new Error("Unauthorized");

  if (status === "IN_PROGRESS") {
    const rows = await sql`UPDATE rides SET status = ${status}, started_at = NOW(), updated_at = NOW() WHERE id = ${rideId} RETURNING *`;
    return rows[0];
  }
  if (status === "COMPLETED") {
    const rows = await sql`UPDATE rides SET status = ${status}, completed_at = NOW(), updated_at = NOW() WHERE id = ${rideId} RETURNING *`;
    return rows[0];
  }
  const rows = await sql`UPDATE rides SET status = ${status}, updated_at = NOW() WHERE id = ${rideId} RETURNING *`;
  return rows[0];
}

export async function completeRideAsRider(rideId: string, riderId: string) {
  const existing = await sql`SELECT rider_id, status FROM rides WHERE id = ${rideId} LIMIT 1`;
  const ride = existing[0];
  if (!ride) throw new Error("Ride not found");
  if (ride.rider_id !== riderId) throw new Error("Unauthorized");
  const rows = await sql`
    UPDATE rides
    SET status = 'COMPLETED', completed_at = NOW(), updated_at = NOW()
    WHERE id = ${rideId}
    RETURNING *
  `;
  return rows[0];
}

export async function cancelRide(rideId: string, userId: string) {
  const existing = await sql`SELECT rider_id, status FROM rides WHERE id = ${rideId} LIMIT 1`;
  const ride = existing[0];
  if (!ride) throw new Error("Ride not found");
  if (ride.rider_id !== userId) throw new Error("Unauthorized");
  if (!["REQUESTED", "ACCEPTED"].includes(ride.status as string)) throw new Error("Cannot cancel this ride");

  const rows = await sql`UPDATE rides SET status = 'CANCELLED', updated_at = NOW() WHERE id = ${rideId} RETURNING *`;
  return rows[0];
}

export async function getAvailableRides() {
  return sql`
    SELECT r.*, json_build_object('id', u.id, 'name', u.name, 'avatar', u.avatar) AS rider
    FROM rides r
    LEFT JOIN users u ON u.id = r.rider_id
    WHERE r.status = 'REQUESTED' AND r.captain_id IS NULL
    ORDER BY r.created_at ASC
  `;
}

export async function getCaptainRideHistory(captainId: string, page = 1, limit = 10) {
  const offset = (page - 1) * limit;
  const rides = await sql`
    SELECT
      r.*,
      json_build_object('id', u.id, 'name', u.name) AS rider
    FROM rides r
    LEFT JOIN users u ON u.id = r.rider_id
    WHERE r.captain_id = ${captainId}
    ORDER BY r.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  const totals = await sql`SELECT COUNT(*)::int AS count FROM rides WHERE captain_id = ${captainId}`;
  const total = totals[0]?.count ?? 0;
  return { rides, total, pages: Math.ceil(total / limit), page };
}
