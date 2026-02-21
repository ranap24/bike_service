import { sql } from "../lib/db";

export async function getAllCaptains(page = 1, limit = 20) {
  const offset = (page - 1) * limit;
  const captains = await sql`
    SELECT
      id, name, email, phone,
      vehicle_type AS "vehicleType",
      vehicle_plate AS "vehiclePlate",
      vehicle_model AS "vehicleModel",
      vehicle_color AS "vehicleColor",
      is_online AS "isOnline",
      is_verified AS "isVerified",
      is_active AS "isActive",
      rating, total_rides AS "totalRides",
      created_at AS "createdAt",
      current_latitude AS "currentLatitude",
      current_longitude AS "currentLongitude"
    FROM captains
    ORDER BY created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  const totals = await sql`SELECT COUNT(*)::int AS count FROM captains`;
  const total = totals[0]?.count ?? 0;
  return { captains, total, pages: Math.ceil(total / limit), page };
}

export async function updateCaptainLocation(captainId: string, lat: number, lng: number) {
  const rows = await sql`
    UPDATE captains
    SET current_latitude = ${lat}, current_longitude = ${lng}, updated_at = NOW()
    WHERE id = ${captainId}
    RETURNING id
  `;
  return rows[0];
}

export async function toggleCaptainOnlineStatus(captainId: string, isOnline: boolean) {
  const rows = await sql`
    UPDATE captains
    SET is_online = ${isOnline}, updated_at = NOW()
    WHERE id = ${captainId}
    RETURNING id, is_online AS "isOnline"
  `;
  return rows[0];
}

export async function getCaptainProfile(captainId: string) {
  const rows = await sql`
    SELECT
      id, name, email, phone, avatar,
      vehicle_type AS "vehicleType",
      vehicle_plate AS "vehiclePlate",
      vehicle_model AS "vehicleModel",
      vehicle_color AS "vehicleColor",
      is_online AS "isOnline",
      is_verified AS "isVerified",
      is_active AS "isActive",
      rating, total_rides AS "totalRides",
      created_at AS "createdAt"
    FROM captains
    WHERE id = ${captainId}
    LIMIT 1
  `;
  return rows[0] ?? null;
}
